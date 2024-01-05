"use strict"

const profileContainer = document.getElementById('profile');
let userData;

window.onload = function() {
    const postBtn = document.querySelector('#postBtn');
    postBtn.onclick = addPost;

    fetchUserData(); 

    const editBtn = document.getElementById("editBtn");
    editBtn.onclick = editUser;
};

function fetchUserData() {
    userData = getLoginData();

    if (userData.username) {
        profileContainer.querySelector('h2').innerText = userData.username;
    }

    fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${userData.username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userData.token}`
        }
    })
    .then(res => res.json())
    .then(retrievedUserData => {
        if (retrievedUserData.bio) {
            profileContainer.querySelector('p').innerText = retrievedUserData.bio;
        }
    })
    .catch((err) => console.error('Error fetching user data:', err));
}

function addPost(e) {
    e.preventDefault();

    const textareaContent = document.querySelector('#textarea');
    const bodyData = { text: textareaContent.value };

    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
        method: 'POST',
        body: JSON.stringify(bodyData),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userData.token}`
        }
    })
    .then(response => response.json())
    .then(createPost => {
        console.log(createPost);
        textareaContent.value = '';
    });
}

function editUser() {
    const bioEl = profileContainer.querySelector('p');
    const newBio = prompt('Enter your new bio:', bioEl.innerText);

    if (newBio) {
        bioEl.innerText = newBio;
        userData = getLoginData();
        const currentUsername = userData.username;

        fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${currentUsername}`, {
            method: 'PUT',
            body: JSON.stringify({ bio: newBio }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${userData.token}`
            }
        })
        .then(res => res.json())
        .then(updatedUserData => {
            console.log(updatedUserData);
            fetchAndDisplayUpdatedUserData(updatedUserData);
        })
        .catch(err => console.error('Error updating bio:', err));
    } else {
        alert("Please enter a valid bio");
    }
}

function fetchAndDisplayUpdatedUserData(updatedUserData) {
    // if (!updatedUserData || !updatedUserData.username) {
    //     console.error('Invalid updated user data:', updatedUserData);
    //     return;
    // }

    const updatedUsername = updatedUserData.username;

    fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${updatedUsername}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userData.token}`
        }
    })
    .then(res => res.json())
    .then(retrievedUserData => {
        console.log('Retrieved User Data:', retrievedUserData);
        displayProfile(retrievedUserData);
    })
    .catch(err => console.error('Error fetching updated user data:', err));
}

function displayProfile(retrievedUserData) {
    console.log('Updated UI with retrievedUserData:', retrievedUserData);

    const bioElement = profileContainer.querySelector('p');
    bioElement.innerText = retrievedUserData.bio;
}
