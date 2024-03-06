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
  } else { // if user is not logged in procees to next route handler
    next();
  }
};

module.exports = { findUserByEmail, generateRandomString, checkIfLoggedIn };