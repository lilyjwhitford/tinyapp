const { users, urlDatabase } = require("./data");

// helper function to find user by email
const getUserByEmail = function(email, database) { // helper function that takes in email 
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId].id // returns the entire user object
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

// helper function that returns URL where userID is equal to the if of user
const urlsForUser = function(id){
  const userUrls = {}; // initialize empty object to store URLS for specific user
  for (let shortURL in urlDatabase) { // iterate over each entry in urlDatabase
    if (urlDatabase[shortURL].userId === id) { // check if userID of current URL matches provided id
      userUrls[shortURL] = (urlDatabase[shortURL].longURL) // if it matches, add longURL to new array
    }
  }
  return userUrls; // return object of URLS for specific user
};

module.exports = { 
  getUserByEmail, 
  generateRandomString, 
  urlsForUser };