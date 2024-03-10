const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const { urlDatabase, users } = require("./data");

// create new instance of express application
const app = express();

// default port 8080
const PORT = 8080; 

// use middleware to parse cookies
app.use(cookieSession({
  name: "session",
  keys: ["superSecretKeyPleaseDontHackMe1", "superSecretKeyPleaseDontHackMe2"]
  })
);

// middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// set EJS as templating engine
app.set('view engine', 'ejs');

// route to home page
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

// route to display URLs in json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route to display URLs, rendering URLs for logged-in user
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.status(401).send(`<h1>You must be logged in to view shortened URLs. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
  
  const userUrls = urlsForUser(user.id);

  const templateVars = {
    urls: userUrls,
    user: user 
  };
  res.render("urls_index", templateVars);
});

// route for creating new URLs, creates new short URL for logged-in user
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.status(401).send(`<h1>You must be logged in to shorten URLs. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[id] = { longURL: longURL, userId: user.id};
  res.redirect(`/urls/${id}`);
  }
});

// route to display page for creating new short URL
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  res.render("urls_new", { user: user });
});

// route to display URLs for the given ID if user is logged in and owns the URL
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.status(404).send(`<h1>Error 404: URL Not Found</h1>`)
  }
  if (!user || urlDatabase[req.params.id].userId !== user.id) {
    return res.status(403).send("<h1>Error 403: You do not have access URL.</h1>");
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: longURL,
    user: user
  }; 
  res.render("urls_show", templateVars);
});

// route to redirect to long URL if it exists
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL; // fetch longURL associated with id from urlDatabase

  if (longURL) { // check if longURL exists in urlDatabase
    return res.redirect(longURL);
  }
  res.status(404).send(`<h1> Error 404: URL Not Found.<h1>`);
});

// route to delete a URL if the user is logged in and owns the URL
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id; // extract the id from request parameters
  //check if URL id exists in database
  if (!urlDatabase[id]) {
    res.status(404).send(`<h1>Error 404: URL Not Found.</h1>`);
  }
  // check if user is logged in
  if (!userId) {
    res.status(403).send(`<h1>Error 403: You cannot shorten URLs if you are not logged in. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
  // check if user owns the URL
  if (urlDatabase[id].userId !== userId) {
    res.status(401).send(`<h1>Error 401: You do not have permission to shorten this URL.<h1>`);
  }
  // delete URL from database if no errors occur
  delete urlDatabase[id];
  res.redirect("/urls"); // once its deleted. redirect user back to "/urls"
});

// route to update a URL if user if logged in and owns the URL
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  // check if URL if exists in the database
  if (!urlDatabase[id]) {
    return res.status(404).send(`<h1>Error 404: URL Not Found.</h1>`);
  }
  // check if user is logged in
  if (!userId) {
    return res.status(403).send(`<h1>Error 403: You are not logged in. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
  // check if user owns the URL
  if (urlDatabase[id].userId !== userId) {
    return res.status(401).send(`<h1>Error 401: You do not own this URL.</h1>`);
  }
  // if no errors occur update longURL property in database
  urlDatabase[id].longURL = newLongURL;
  return res.redirect("/urls");
});

// route to display login page. redirects to "/urls" if user is logged in
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
  user: user
  };
  if (user) { 
    res.redirect("/urls");
  } else { 
    res.render("login", templateVars);
  }
});

// route to handle user login if email/password are correct
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (user === null || bcrypt.compareSync(password, user.password) === false) {
    return res.status(403).send("Error 403: E-mail/Password cannot be found.");
  }
  
  if (user !== null && bcrypt.compareSync(password, user.password) === true) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

// route to log user out
app.post("/logout", (req, res) => {
  req.session = null; // clears session
  res.redirect("/login");
});

// route to render registration page
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user: user
  };
  if (user) { 
    res.redirect("/urls");
  } else { 
    res.render("register", templateVars);
  }
});

// route to handle user registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const existingUser = getUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("Error 400: E-mail/Password cannot be empty.");
  } // if password/email fields are empty, return 404 status code

  if (existingUser) {
    return res.status(400).send("Error 400: E-mail already in use.");
  } // if email is already in use, return 404 status code

  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  users[userId] = newUser;
  req.session.user_id = userId;

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});