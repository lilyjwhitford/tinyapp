const express = require("express");
const { findUserByEmail, generateRandomString, checkIfLoggedIn, checkIfNotLoggedIn, checkIfNotLoggedInForPost, checkIfNotLoggedInForGet, urlsForUser } = require("./helperFuncs");
const { urlDatabase, users } = require("./data");

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", checkIfNotLoggedInForGet, (req, res) => {
  const user = users[req.cookies["user_id"]]; // lookup user object using user_id cookie value
  const userUrls = urlsForUser(user.id); // use the users id from the cookie to filter URLS for the logged-in user
  const templateVars = {
    urls: userUrls, // pass filteres URLS to template
    user: user // pass entire user object via templateVars
  };
  res.render("urls_index", templateVars); // render urls_index template with provided template vars
});

app.get("/urls/new",checkIfNotLoggedIn, (req, res) => {
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

app.post("/urls", checkIfNotLoggedInForPost, (req, res) => { // making POST request to /urls
  const id = generateRandomString(); // generating random short URL/id
  const longURL = req.body.longURL; // grab longURL from form input
  const userID = req.cookies["user_id"]; // 
  urlDatabase[id] = { longURL, userID }; // save id-longURL to urlDatabse when it recieves POST request to "/urls"
  res.redirect(`/urls/${id}`); // respond with redirect to /urls/id
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // extract the id from request parameters
  const longURL = urlDatabase[id].longURL; // fetch longURL associated with id from urlDatabase

  if (longURL) { // check if longURL exists in urlDatabase
    return res.redirect(302, longURL); // if it does exist, redirect to longURL using status code 302 (found)
  } else {
    return res.status(404).send(`<h1>Error 404: URL Not Found</h1>`); // if longURL doesnt exist in urlDatabase, send 404 status code
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
    urlDatabase[id].longURL = newLongURL; // update longURL in database
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

app.get("/register", checkIfLoggedIn, (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user: user
  };
  return res.render("register", templateVars);
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

app.get("/login", checkIfLoggedIn, (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
  user: user
  };
  return res.render("login", templateVars);
});