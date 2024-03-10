const { urlDatabase } = require("./data");

// helper function to find user by email
const getUserByEmail = function(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
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
const urlsForUser = function(id) {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser };