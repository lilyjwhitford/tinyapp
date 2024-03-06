const { users } = require("./data");

// helper function to find user by email
const findUserByEmail = function(email) { // helper function that takes in email 
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId] // returns the entire user object
    }
  }
  return null; // returns null if not found
};

// helper function to generate random strings
const generateRandomString = function() {
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = possibleChars.length;
  for (let i = 0; i < 6; i++) {
    result += possibleChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// helper function to check if user is logged in 
const checkIfLoggedIn = function(req, res, next) {
  const user = users[req.cookies["user_id"]];
  if (user) { // if user is logged in redirect to /urls
    return res.redirect("/urls");
  } else { // if user is not logged in proceed to next route handler
    next();
  }
};

// helper function to check if user is logged in 
const checkIfNotLoggedIn = function(req, res, next) {
  const user = users[req.cookies["user_id"]];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in redirect to /login
    return res.redirect("/login");
  }
};

// helper function to check if user is logged in 
const checkIfNotLoggedInForPost = function(req, res, next) {
  const user = users[req.cookies["user_id"]];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in send HTML message telling the user why
    return res.send(`<h1>You must be logged in to shorten URLs</h1>`);
  }
};

module.exports = { findUserByEmail, generateRandomString, checkIfLoggedIn, checkIfNotLoggedIn, checkIfNotLoggedInForPost };