const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Receives string of characters to make a random string from or uses a default
const generateRandomString = (characters) => {
  const defaultCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // if characters is null, use defaultCharacters to generate string
  let using = characters ? characters : defaultCharacters;
  let result = '';

  for (let i = 0; i < 5; i++) {
    result += using[Math.floor(Math.random() * using.length)];
  }

  return result;
};

//
// Middleware
//
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

//
// Add
//
app.post('/urls', (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;

  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const deleteId = req.params.id;
  delete urlDatabase[deleteId];

  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  let changeId = req.params.id;
  urlDatabase[changeId] = req.body.longURL;

  res.redirect(`/urls/${changeId}`);
});

app.get('/', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_new', templateVars);
});

app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});