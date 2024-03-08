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
  const user = users[req.session.user_id];
  if (user) { // if user is logged in redirect to /urls
    return res.redirect("/urls");
  } else { // if user is not logged in proceed to next route handler
    next();
  }
};

// helper function to check if user is logged in 
const checkIfNotLoggedIn = function(req, res, next) {
  const user = users[req.session.user_id];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in redirect to /login
    return res.redirect("/login");
  }
};

// helper function to check if user is logged in to POST /urls and returns appropriate message
const checkIfNotLoggedInForPost = function(req, res, next) {
  const user = users[req.session.user_id];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in send HTML message telling the user to login/register
    return res.send(`<h1>You must be logged in to shorten URLs. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
};
// helper function to check if user is logged in to GET /urls and returns appropriate message
const checkIfNotLoggedInForGet = function(req, res, next) {
  const user = users[req.session.user_id];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in send HTML message telling the to login/register
    return res.send(`<h1>You must be logged in to view shortened URLs. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
};

// helper function that returns URL where userID is equal to the if of user
const urlsForUser = function(id){
  const userUrls = []; // initialize empty array to store URLS for specific user
  for (let shortURL in urlDatabase) { // iterate over each entry in urlDatabase
    if (urlDatabase[shortURL].userId === id) { // check if userID of current URL matches provided id
      userUrls.push(urlDatabase[shortURL].longURL) // if it matches, add longURL to new array
    }
  }
  return userUrls; // return array or URLS for specific user
};
// helper function to check if user is logged in on GET /urls/:id
const checkIfNotLoggedInId = function(req, res, next) {
  const user = users[req.session.user_id];
  if (user) { // if user is logged proceed to next route handler
    next();
  } else { // if user is not logged in return message to register/login
    return res.status(403).send(`<h1>You cannot access this page if you are not logged in. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
};

// helper function to check if logged in user owns URL
const checkUrlOwnership = function(req, res, next) {
  const user = users[req.session.user_id];
  const urlId = req.params.id;
  const urlInfo = urlDatabase[urlId];
  if (urlInfo && urlInfo.userId === user.id) {
    next();
  } else {
    res.status(403).send(`<h1>Access Denied: You do not own this URL.<h1>`)
  }
};

module.exports = { 
  findUserByEmail, 
  generateRandomString, 
  checkIfLoggedIn, 
  checkIfNotLoggedIn, 
  checkIfNotLoggedInForPost,
  checkIfNotLoggedInForGet,
  urlsForUser,
  checkIfNotLoggedInId,
  checkUrlOwnership };