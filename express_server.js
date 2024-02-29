const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateRandomString() {
  let result = "";
  const charactersLength = possibleChars.length;
  for (let i = 0; i < 6; i++) {
    result += possibleChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }; // pass both values to the template
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

  if (longURL) {
    res.redirect(302, longURL); // use 302 status code for (found)
  } else {
    res.status(404).send("404 Error: Not found"); // if id doesnt exist in urlDatabase, send 404 status code (error)
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // extract the id from request parameters
  delete urlDatabase[id]; // remove the URL from the urlDatabase using delete operator
  res.redirect("/urls") // once its been deleted, redirect back to "/urls"
})