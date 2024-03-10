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

app.get("/", (req, res) => {
  res.redirect("/login");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id]; // lookup user object using user_id cookie value
  if (!user) {
    res.status(401).send(`<h1>You must be logged in to view shortened URLs. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  }
  
  const userUrls = urlsForUser(user.id); // use the users id from the cookie to filter URLS for the logged-in user
  
  const templateVars = {
    urls: userUrls, // pass filteres URLS to template
    user: user // pass entire user object via templateVars
  };
  res.render("urls_index", templateVars); // render urls_index template with provided template vars
});

app.post("/urls", (req, res) => { // making POST request to /urls
  const user = users[req.session.user_id];
  if (!user) {
    res.status(401).send(`<h1>You must be logged in to shorten URLs. Please <a href="/login">login</a> or <a href="/register">register.<h1>`);
  } else {
    const id = generateRandomString(); // generating random short URL/id
    const longURL = req.body.longURL; // grab longURL from form input
    urlDatabase[id] = { longURL: longURL, userId: user.id}; // save id-longURL to urlDatabse when it recieves POST request to "/urls"
  res.redirect(`/urls/${id}`); // respond with redirect to /urls/id
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user: user
  };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: user
  }; // pass both values to the template
  res.render("urls_show", templateVars); // render the urls_show template
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id; // extract the id from request parameters
  const longURL = urlDatabase[id].longURL; // fetch longURL associated with id from urlDatabase

  if (longURL) { // check if longURL exists in urlDatabase
    return res.redirect(longURL); // if it does exist, redirect to longURL using status code 302 (found)
  } else {
    return res.status(404).send(`<h1> Error 404: URL Not Found.<h1>`); // if longURL doesnt exist in urlDatabase, send 404 status code
  }
});

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

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("Error 403: E-mail/Password cannot be found");
  }
  const isValidPassword = bcrypt.compareSync(password, user.password); // compare password with hashed password

  if (!isValidPassword) { // check if password is correct
    return res.status(403).send("Error 403: E-mail and Password do not match");
  }
  
  req.session.user_id = user.id; // if password is correct, proceed with login
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null; // clears session
  res.redirect("/login");
});

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

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const existingUser = getUserByEmail(email);
  if (!email || !password) {
    return res.status(400).send("Error 400: E-mail/Password cannot be empty");
  } // if password/email fields are empty, return 404 status code
  if (existingUser) {
    return res.status(400).send("Error 400: E-mail already in use");
  } // if email is already in use, return 404 status code
  const userId = generateRandomString(); // generate random userID
  const newUser = { // extract email and password from req.body
    id: userId,
    email: req.body.email,
    password: hashedPassword // store hashed password
  };
  users[userId] = newUser; // add new user to users object
  
  req.session.user_id = userId; // set user_id cookie
  res.redirect("/urls"); // redirect to /urls page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});