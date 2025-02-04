/* auth.js provides LOGIN-related functions */

"use strict";

//const apiBaseURL = "https://microbloglite.herokuapp.com";
const apiBaseURL = "https://microbloglite.onrender.com";
// Backup server:   https://microbloglite.onrender.com

// You can use this function to get the login data of the logged-in
// user (if any). It returns either an object including the username
// and token, or an empty object if the visitor is not logged in.
function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

// You can use this function to see whether the current visitor is
// logged in. It returns either `true` or `false`.
function isLoggedIn() {
  const loginData = getLoginData();
  return Boolean(loginData.token);
}

// This function is already being used in the starter code for the
// landing page, in order to process a user's login. READ this code,
// and feel free to re-use parts of it for other `fetch()` requests
// you may need to write.
function login(loginData) {
  // POST /auth/login
  const options = {
    method: "POST",
    headers: {
      // This header specifies the type of content we're sending.
      // This is required for endpoints expecting us to send
      // JSON data.
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  };

  return fetch(apiBaseURL + "/auth/login", options)
    .then((response) => response.json())
    .then((loginData) => {
      window.localStorage.setItem("login-data", JSON.stringify(loginData));
      window.location.assign("/posts"); // redirect

      return loginData;
    });
}

// register function

/// This line declares a function named register that takes registerData as a parameter.
function register(registerData) {

  /// POST request to /api/users with user registration data
   const options = {
     method: "POST",
     headers: {
       // This header specifies the type of content we're sending.
       // This is required for endpoints expecting us to send
       // JSON data.
       "Content-Type": "application/json", 
     },
     body: JSON.stringify(registerData),
   };
 
 //Here, it prepares the options object for a POST request. It sets the method to "POST,"
  //specifies the content type as JSON, and converts registerData into a JSON string for the request body.
  
 /// Send the registration request to the server
   return fetch(apiBaseURL + "/api/users", options)
     .then((response) => response.json())
     .then((registerData) => {
       console.log(registerData);
       window.location.assign("/landing"); // redirect to login
 
       return registerData;
     });
 }
 //This block uses the Fetch API to send a POST request to the server endpoint ("/api/users") with the provided options. 
 //It then processes the response, logs it to the console, redirects to "/landing" if successful, and returns the registration data.
 

 
 

// This is the `logout()` function you will use for any logout button
// which you may include in various pages in your app. Again, READ this
// function and you will probably want to re-use parts of it for other
// `fetch()` requests you may need to write.
function logout() {
  const loginData = getLoginData();

  // GET /auth/logout
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  };

  fetch(apiBaseURL + "/auth/logout", options)
    .then((response) => response.json())
    .then((data) => console.log(data))
    .finally(() => {
      // We're using `finally()` so that we will continue with the
      // browser side of logging out (below) even if there is an
      // error with the fetch request above.

      window.localStorage.removeItem("login-data"); // remove login data from LocalStorage
      window.location.assign("/landing"); // redirect back to the landing page
    });
}

