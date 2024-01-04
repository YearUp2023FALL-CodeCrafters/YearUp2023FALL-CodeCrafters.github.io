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
    console.log(`Liking post with ID: ${postId}`);
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

// async function unlikePost(likeId) {
//   try {
//     console.log(`Unliking post with Like ID: ${likeId}`);
//     const token = getLoginData().token;

//     const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const unlikedPost = await response.json();
//     console.log(unlikedPost);
//     fetchAllPosts();
//   } catch (error) {
//     console.error("Failed to unlike the post:", error);
//   }
// }

function deletePost(postId) {
  const token = getLoginData().token;
  const apiUrl = `http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts/${postId}`;

  // Fetch post data to check for the creator
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
      console.error("Error deleting post", error);
    });
}

function checkUserLiked(post) {
    // CHECKING TO SEE IF USER HAS LIKED THE POST. 
  return post.likes.find(like => like.username === getLoginData().username);
}

function toggleLike(postId, userLiked) {
  const likeButton = document.getElementById(`likeButton_${postId}`);

  if (likeButton) {
    if (userLiked) {
      likeButton.innerHTML = getLikeIcon();
    } else {
      likePost(postId);
      likeButton.innerHTML = getUnlikeIcon();
    }
  } else {
    console.error(`Button not found for post with ID ${postId}`);
  }
}


function getLikeIcon() {
  return '<i class="far fa-heart"></i>';
}

function getUnlikeIcon() {
  return '<i class="fas fa-heart"></i>';
}

function displayAllPosts(allPosts) {
  let allPostContainer = document.getElementById("allPostContainer");

  allPosts?.forEach((post) => {
    // passing in post, so we can see if user has liked it.
    const userLiked = checkUserLiked(post);

    const card = document.createElement("div");
    card.className = "card mb-3";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    cardBody.innerHTML = `
      <h3 class="card-title">${post.text}</h3>
      <p class="card-text">By: ${post.username}</p>
      <button class="border-0 bg-transparent text-light" onclick="toggleLike('${post._id}', ${userLiked})" id="likeButton_${post._id}">
        ${userLiked ? getUnlikeIcon() : getLikeIcon()} 
      </button>
      <button class="border-0 bg-transparent text-light" onclick="deletePost('${post._id}')">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    card.appendChild(cardBody);
    // giving our card an id. 
    card.id = `postCard_${post._id}`;
    allPostContainer.appendChild(card);
  });
}




