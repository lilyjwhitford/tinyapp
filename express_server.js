const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const alphaNumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateRandomString() {
  let result = "";
  const charactersLength = alphaNumericChars.length;
  for (let i = 0; i < 6; i++) {
    result += alphaNumericChars.charAt(Math.floor(Math.random() * charactersLength));
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

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  console.log(req.body); // log the post request body to the console
  res.send(randomString); // respond with random string
});