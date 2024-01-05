"use strict";

window.onload = () => {
  fetchAllPosts();
};

async function fetchAllPosts() {
  try {
    const token = getLoginData().token;

    const response = await fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts?limit=18", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allPosts = await response.json();
    console.log(allPosts);
    displayAllPosts(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts", error);
  }
}

async function likePost(postId) {
  try {
    console.log(`Liking post ${postId}`);
    const token = getLoginData().token;

    const bodyObject = {
      postId: postId,
    };

    const response = await fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyObject),
    });

    const likedPost = await response.json();
    console.log(likedPost);
    fetchAllPosts();
  } catch (error) {
    console.error("Failed to like the post:", error);
  }
}

function deletePost(postId) {
  const token = getLoginData().token;
  const apiUrl = `http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts/${postId}`;

  // Fetch GET request to make sure data is created by user
  fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    // CHECKING TO SEE IF LOGGED IN USERNAME MATCHES THE PERSON WHO CREATED IT
    .then((postData) => {
      if (getLoginData().username === postData.username) {
        // If yes, proceed with the delete request
        return fetch(apiUrl, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        const card = document.getElementById(`postCard_${postId}`);
        if (card) {
          const errMsg = document.createElement("p");
          errMsg.innerHTML = "You don't have permission to delete this post.";
          errMsg.style.color = "red";
          card.appendChild(errMsg);
        }
        // THIS WILL STOP CODE FROM CONTINUING AND MOVE ON TO THE CATCH ERROR
        throw new Error("Permission denied");
      }
    })
    .then(() => {
      // IF POST CAN DELETE, THIS WILL RUN
      const card = document.getElementById(`postCard_${postId}`);
      if (card) {
        card.remove();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function checkUserLiked(post) {
    // CHECKING TO SEE IF USER HAS LIKED THE POST. 
  return post.likes.find(like => like.username === getLoginData().username);
}

async function toggleLike(postId, userLiked) {
  const likeButton = document.getElementById(`likeButton_${postId}`);

  if (likeButton) {
    likeButton.innerHTML = userLiked ? emptyHeartIcon() : filledHeartIcon();

    try {
      // if the userLiked is not true, we're going to run the likePost req and pass in the postID. 
      if (!userLiked) {
        await likePost(postId);
      }
    } catch (error) {
      console.error("YOU ALREADY LIKED THIS POST", error);
    }
  }
}

// async function toggleLike(postId, userLiked) {
//   const likeButton = document.getElementById(`likeButton_${postId}`);

//   if (likeButton) {
//     // Update the UI immediately
//     likeButton.innerHTML = userLiked ? filledHeartIcon() : emptyHeartIcon();

//     try {
//       // Send the like request
//       if (!userLiked) {
//         await likePost(postId);
//       }
//     } catch (error) {
//       console.error("Failed to like", error);
//     }
//   }
// }


function filledHeartIcon() {
  return '<i class="fa-solid fa-heart"></i>';
}

// unfilled icon 
function emptyHeartIcon() {
  return '<i class="fa-regular fa-heart"</i>'

}

function displayAllPosts(allPosts) {
  let allPostContainer = document.getElementById("allPostContainer");

  allPosts?.forEach((post) => {
    //passing in post, so we can see if the user has liked it.
    const userLiked = checkUserLiked(post);

    const card = document.createElement("div");
    card.className = "card mb-3";
     //giving our card an id. 
    card.id = `postCard_${post._id}`;

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const likeButton = document.createElement("button");
    likeButton.className = "border-0 bg-transparent text-light";
    likeButton.id = `likeButton_${post._id}`;

    if (userLiked) {
      likeButton.innerHTML = filledHeartIcon();
      console.log(`WE JUST LIKED THE POST`)
    } else {
      likeButton.innerHTML = emptyHeartIcon();
      console.log(`WE JUST UNLIKED THE POST`)
    }

    likeButton.onclick = async function() {
      await toggleLike(post._id);
    };
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "border-0 bg-transparent text-light";
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.onclick = function() {
      deletePost(post._id);
    };

    cardBody.innerHTML = `
      <h3 class="card-title">${post.text}</h3>
      <p class="card-text">By: ${post.username}</p>
    `;

    cardBody.appendChild(likeButton);
    cardBody.appendChild(deleteButton);
    card.appendChild(cardBody);

    allPostContainer.appendChild(card);
  });
}

