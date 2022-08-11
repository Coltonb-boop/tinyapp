const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
const bcrypt = require('bcryptjs');

const morgan = require('morgan');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aaaaaa"
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "aaaaaa"
  }
};

const users = {
  aaaaaa: {
    id: "aaaaaa",
    email: "user@example.com",
    password: "purple",
  }
};

//
// Middleware
//

app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));   // logs server events for us
app.use(cookieSession({   // allows us access to req.session
  name: 'session',
  keys: ['bestKey']
}));
app.use(methodOverride('_method'));
//
// Add
//

/**
 * Endpoint for logging in. Checks user credentials and stores
 * user_id in a cookie and redirects to /urls
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let userFromDatabase = getUserByEmail(email, users);

  if (!userFromDatabase) {
    res.status(403).send('Couldn\'t find a user with that email');
    return;
  }
  
  if (!bcrypt.compareSync(password, userFromDatabase.password)) {
    res.status(403).send("Incorrect password");
    return;
  }

  req.session["user_id"] = userFromDatabase.id;

  res.redirect('/urls');
});

/**
 * Endpoint for users registering
 */
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Email or password invalid');
    return;
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Email already taken');
    return;
  }
  
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  req.session['user_id'] = id;

  res.redirect('/urls'); // eventually /urls
});

/**
 * Endpoint for logging out. Currently deletes user cookie and redirects to /urls
 */
app.post('/logout', (req, res) => {
  req.session = null;

  res.redirect('/urls');
});

/**
 * Endpoint for /urls. Will catch a user making a new shortURL, store it in
 * our database, and redirect to /urls
 */
app.post('/urls', (req, res) => {
  if (!req.session.user_id) { // if not logged in
    res.send("You must login to create shortURLs");
    return;
  }
  
  const newShort = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const newDatabaseObj = {
    longURL,
    userID
  };
  urlDatabase[newShort] = newDatabaseObj;

  res.redirect(`/urls/${newShort}`);
});

/**
 * Endpoint for deleting a shortURL. Redirects to /urls
 */
app.delete('/urls/:id', (req, res) => {
  if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.id].userID) { // if not logged in
    res.send('This is either not your shortURL or you haven\'t logged in.');
    return;
  }

  const deleteId = req.params.id;

  if (!urlDatabase[deleteId]) {
    res.send('That shortURL doesn\' exist!');
    return;
  }
  
  delete urlDatabase[deleteId];

  res.redirect('/urls');
});

/**
 * Endpoint for editting. Will update a longURL in the database using the shortURL.
 * Redirects to /urls/:shortURL
 */
app.put('/urls/:id', (req, res) => {
  if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.id].userID) { // if not logged in
    res.send('This is either not your shortURL or you haven\'t logged in.');
    return;
  }

  let changeId = req.params.id;

  if (!urlDatabase[changeId]) {
    res.send('That shortURL doesn\' exist!');
    return;
  }
  
  urlDatabase[changeId].longURL = req.body.longURL;

  res.redirect(`/urls/${changeId}`);
});

//
// Read
//

/**
 * Endpoint for main landing page. Shows urls_index
 */
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

/**
 * Catches a user trying to use a shortURL to get to the longURL
 */
app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) { // check longURL exists
    res.send("That shortURL doesn't exist");
    return;
  }

  let longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

/**
 * Endpoint for developers to see the json database
 */
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

/**
 * Endpoint for /urls. Simply loads the list of stored URLs
 */
app.get('/urls', (req, res) => {
  let message = '';
  let user = req.session.user_id;
  
  if (!user) {
    message = 'You must be logged in to see your shortURLs';
  }
  
  let usersURLs = urlsForUser(user, urlDatabase);

  // if no shortURLs found for this user, set our message to something helpful
  if (user && Object.keys(usersURLs).length === 0) {
    message = 'You must have no shortURLs! You can create shortURLs using the "Create New URL" tab.';
  }

  const templateVars = {
    users,
    message,
    urls: usersURLs,
    userId: req.session['user_id'],
  };
  
  res.render('urls_index', templateVars);
});

/**
 * Endpoint for the create new shortURL page
 */
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) { // if not logged in
    res.redirect('/login');
    return;
  }
  
  const templateVars = {
    users,
    id: req.params.id,
    userId: req.session['user_id']
  };

  res.render('urls_new', templateVars);
});

/**
 * Endpoint for looking at a specific shortURL
 */
app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id || req.session.user_id !== urlDatabase[req.params.id].userID) { // if not logged in
    res.send('This is either not your shortURL or you haven\'t logged in.');
    return;
  }

  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userId: req.session['user_id']
  };

  res.render('urls_show', templateVars);
});

/**
 * Endpoint for user login
 */
app.get('/login', (req, res) => {
  if (req.session.user_id) { // if someone is logged in already
    res.redirect('/urls');
    return;
  }
  
  const templateVars = {
    users,
    userId: req.session['user_id'] // can remove because redundant with users: users[req.session['user_id']],
  };

  res.render('urls_login', templateVars);
});

/**
 * Endpoint for user registration
 */
app.get('/register', (req, res) => {
  if (req.session.user_id) { // if someone is logged in already
    res.redirect('/urls');
    return;
  }
  
  const templateVars = {
    users,
    userId: req.session['user_id']
  };

  res.render('urls_register', templateVars);
});

/**
 * Catch-all random routes and throw a 404
 */
app.get('*', (req, res) => {
  res.status(404).send('This page doesn\'t exist');
});

/**
 * Start the listener
 */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});