const express = require("express");


const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};

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

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]; // lookup user object using user_id cookie value
  const templateVars = {
    urls: urlDatabase,
    user: user // pass entire user object via templateVars
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: user
  }; // pass both values to the template
  res.render("urls_show", templateVars); // render the urls_show template
});

app.post("/urls", (req, res) => { // making POST request to /urls
  const id = generateRandomString(); // generating random short URL/id
  const longURL = req.body.longURL; // grab longURL from form input
  urlDatabase[id] = longURL; // save id-longURL to urlDatabse when it recieves POST request to "/urls"
  res.redirect(`/urls/${id}`); // respond with redirect to /urls/id
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // extract the id from request parameters
  const longURL = urlDatabase[id]; // fetch longURL associated with id from urlDatabase

  if (longURL) { // check if longURL exists in urlDatabase
    return res.redirect(302, longURL); // if it does exist, redirect to longURL using status code 302 (found)
  } else {
    return res.status(404).send("404 Error: URL not found"); // if longURL doesnt exist in urlDatabase, send 404 status code
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // extract the id from request parameters
  delete urlDatabase[id]; // remove the URL from the urlDatabase using delete operator
  res.redirect("/urls"); // once its been deleted, redirect back to "/urls"
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL; 

  if (urlDatabase[id]) { // check if shortURL id exists in database
    urlDatabase[id] = newLongURL; // update longURL in database
    return res.redirect("/urls"); // redirect user back to "/urls"
  } else {
    return res.status(404).send("404 Error: URL not found"); // if shortURL doesnt exist, 404 status code
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(403).send("403 Error: E-mail/Password cannot be found");
  }
  if (user && user.password !== password) {
    return res.status(403).send("403 Error: E-mail and Password do not match");
  }
  if (user && user.password === password) {
    res.cookie("user_id", user.id);
    return res.redirect("/urls"); // redirect user to home/login page
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // clear "user_id" cookie to log user out
  res.redirect("/login"); // redirect user to home/login page
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user: user
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = findUserByEmail(email);
  if (email === "" || password === "") {
    return res.status(400).send("400 Error: E-mail/Password cannot be empty");
  } // if password/email fields are empty, return 404 status code
  if (existingUser) {
    return res.status(400).send("400 Error: E-mail already in use");
  } // if email is already in use, return 404 status code
  const userId = generateRandomString(); // generate random userID
  const newUser = { // extract email and password from req.body
    id: userId,
    email: req.body.email,
    password: req.body.password
  };
  users[userId] = newUser; // add new user to users object
  
  res.cookie("user_id", userId); // set user_id cookie
  res.redirect("/urls"); // redirect to /urls page
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
  user: user
  };
  res.render("login", templateVars);
});