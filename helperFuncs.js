const { users } = require("./data");

const findUserByEmail = function(email) { // helper function that takes in email 
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId] // returns the entire user object
    }
  }
  return null; // returns null if not found
};

const generateRandomString = function() {
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = possibleChars.length;
  for (let i = 0; i < 6; i++) {
    result += possibleChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {findUserByEmail, generateRandomString};