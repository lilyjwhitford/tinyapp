const { users, urlDatabase } = require("./data");

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

// helper function to check if user is logged in to POST and returns approproate message
const checkIfNotLoggedInForPost = function(req, res, next) {
  const user = users[req.cookies["user_id"]];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in send HTML message telling the user to login/register
    return res.send(`<html><body><p>You must be logged in to shorten URLs. Please <a href="/login">login</a> or <a href="/register">register.</a></p></body></html>`);
  }
};

const checkIfNotLoggedInForGet = function(req, res, next) {
  const user = users[req.cookies["user_id"]];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in send HTML message telling the to login/register
    return res.send(`<html><body><p>You must be logged in to view shortened URLs. Please <a href="/login">login</a> or <a href="/register">register.</a></p></body></html>`);
  }
};

// helper function that returns URL where userID is equal to the if of user
const urlsForUser = function(id){
  const userUrls = [];
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls.push(urlDatabase[shortURL].longURL)
    }
  }
  return userUrls;
};

module.exports = { 
  findUserByEmail, 
  generateRandomString, 
  checkIfLoggedIn, 
  checkIfNotLoggedIn, 
  checkIfNotLoggedInForPost,
  checkIfNotLoggedInForGet,
  urlsForUser };