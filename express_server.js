const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs'); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls/:id", (req, res) => {
 const id = req.params.id; // access the id parameter from the route
 const longURL = urlDatabase[id]; // look up the longURL using the id
 const templateVars = { id: id, longURL: longURL }; // pass both values to the template
 res.render("urls_show", templateVars); // render the urls_show template
});