const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Receives string of characters to make a random string from or uses a default
// @strLength defines custom length of string
// @characters defines custom string characters to potentially be in the string
const generateRandomString = (strLength, characters) => {
  const defaultCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // if characters is null, else use defaultCharacters to generate string
  let using = characters ? characters : defaultCharacters;
  // if length null, else use 5 as default
  let length = strLength ? strLength : 5;
  let result = '';

  // find random value within defaultCharacters/characters and concat onto result
  for (let i = 0; i < length; i++) {
    result += using[Math.floor(Math.random() * using.length)];
  }

  return result;
};

//
// Middleware
//

app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));   // logs server events for us
app.use(cookieParser());  // allows us access to req.cookies

//
// Add
//
// Endpoint for logging in. Stores username in a cookie and redirects to /urls
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);

  res.redirect('/urls');
});

// Endpoint for logging out. Currently deletes user cookie and redirects to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');
});

// Endpoint for /urls
// Will catch a user making a new shortURL, store it in our database, and
// redirect to /urls
app.post('/urls', (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;

  res.redirect('/urls');
});

// Endpoint for deleting a shortURL. Redirects to /urls
app.post('/urls/:id/delete', (req, res) => {
  const deleteId = req.params.id;
  delete urlDatabase[deleteId];

  res.redirect('/urls');
});

// Endpoint for editting. Will update a longURL in the database using the shortURL.
// Redirects to /urls/:shortURL
app.post('/urls/:id/update', (req, res) => {
  let changeId = req.params.id;
  urlDatabase[changeId] = req.body.longURL;

  res.redirect(`/urls/${changeId}`);
});

//
// Read
//
// Endpoint for main landing page. Shows urls_index
app.get('/', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

// Endpoint for developers to see the json database
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Endpoint for /urls. Simply loads the list of stored URLs
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

// Endpoint for the create new shortURL page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

// Catches a user trying to use a shortURL to get to the longURL
app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Endpoint for looking at a specific shortURL
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

//
//
//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});