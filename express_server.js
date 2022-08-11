const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { response } = require('express');

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
}

//
// Helper functions
//
// user lookup, takes in email to search for and returns user from users object
const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }

  return null;
}

const urlsForUser = (user) => {
  let urls = {};
  // find this users shortURLs 
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user) {
      urls[url] = urlDatabase[url];
    }
  }

  return urls;
}

// Receives string of characters to make a random string from or uses a default
// @strLength defines custom length of string
// @characters defines custom string characters to potentially be in the string
const generateRandomString = (strLength, characters) => {
  const defaultCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // if characters is null, else use defaultCharacters to generate string
  let using = characters ? characters : defaultCharacters;
  // if length null, else use 5 as default
  let length = strLength ? strLength : 6;
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


// Endpoint for logging out. Currently deletes user cookie and redirects to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');
});

// Endpoint for /urls
// Will catch a user making a new shortURL, store it in our database, and
// redirect to /urls
app.post('/urls', (req, res) => {
  if (!req.cookies.user_id) { // if not logged in
    res.send("You must login to create shortURLs");
    return;
  }
  
  const newShort = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id;
  const newDatabaseObj = {
    longURL,
    userID
  }
  urlDatabase[newShort] = newDatabaseObj;

  res.redirect('/urls');
});

// Endpoint for deleting a shortURL. Redirects to /urls
app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies.user_id || req.cookies.user_id !== urlDatabase[req.params.id].userID) { // if not logged in
    res.send('This is either not your shortURL or you haven\'t logged in.');
    return;
  }

  const deleteId = req.params.id;

  if (!lDatabase[deleteId]) {
    res.send('That shortURL doesn\' exist!');
    return;
  }
  
  delete urlDatabase[deleteId];

  res.redirect('/urls');
});

// Endpoint for editting. Will update a longURL in the database using the shortURL.
// Redirects to /urls/:shortURL
app.post('/urls/:id/update', (req, res) => {
  if (!req.cookies.user_id || req.cookies.user_id !== urlDatabase[req.params.id].userID) { // if not logged in
    res.send('This is either not your shortURL or you haven\'t logged in.');
    return;
  }

  let changeId = req.params.id;

  if (!lDatabase[changeId]) {
    res.send('That shortURL doesn\' exist!');
    return;
  }
  
  urlDatabase[changeId].longURL = req.body.longURL;

  res.redirect(`/urls/${changeId}`);
});

//
// Read
//

// Endpoint for main landing page. Shows urls_index
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Catches a user trying to use a shortURL to get to the longURL
app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) { // check longURL exists
    res.send("That shortURL doesn't exist");
  }

  res.redirect(longURL);
});

// Endpoint for developers to see the json database
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Endpoint for /urls. Simply loads the list of stored URLs
app.get('/urls', (req, res) => {
  let message = '';
  let user = req.cookies.user_id;
  
  if (!user) {
    message = 'You must be logged in to see your shortURLs';
  }
  
  let usersURLs = urlsForUser(user);

  // if no shortURLs found for this user, set our message to something helpful
  if (user && Object.keys(usersURLs).length === 0) {
    // return res.send('<html><body><p>Possible error message</p></body></html>')
    message = 'You must have no shortURLs! You can create shortURLs using the "Create New URL" tab.';
  }

  const templateVars = {
    users,
    message,
    urls: usersURLs,
    userId: req.cookies['user_id'],
  };
  
  res.render('urls_index', templateVars);
});

// Endpoint for the create new shortURL page
app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) { // if not logged in
    res.redirect('/login');
    return;
  }
  
  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userId: req.cookies['user_id']
  };

  res.render('urls_new', templateVars);
});

// Endpoint for looking at a specific shortURL
app.get('/urls/:id', (req, res) => {
  if (!req.cookies.user_id || req.cookies.user_id !== urlDatabase[req.params.id].userID) { // if not logged in
    res.send('This is either not your shortURL or you haven\'t logged in.');
    return;
  }

  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    userId: req.cookies['user_id']
  };

  res.render('urls_show', templateVars);
});

// Endpoint for user login
app.get('/login', (req, res) => {
  if (req.cookies.user_id) { // if someone is logged in already
    res.redirect('/urls');
    return;
  }
  
  const templateVars = {
    users,
    userId: req.cookies['user_id'] // can remove because redundant with users: users[req.cookies['user_id']],
  };

  res.render('urls_login', templateVars);
});

// Endpoint for logging in. Checks user credentials and stores 
// user_id in a cookie and redirects to /urls
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let userFromDatabase = getUserByEmail(email);

  if (!userFromDatabase) {
    res.status(403).send('Couldn\'t find a user with that email');
    return;
  }

  if (password !== userFromDatabase.password) {
    res.status(403).send("Incorrect password");
    return;
  }

  res.cookie('user_id', userFromDatabase.id);

  res.redirect('/urls');
});

// Endpoint for user registration
app.get('/register', (req, res) => {
  if (req.cookies.user_id) { // if someone is logged in already
    res.redirect('/urls');
    return;
  }
  
  const templateVars = {
    users,
    userId: req.cookies['user_id']
  }

  res.render('urls_register', templateVars);
});

// Endpoint for users registering
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Email or password invalid');
    return;
  }
  if (getUserByEmail(req.body.email)) {
    res.status(400).send('Email already taken');
    return;
  }
  
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  users[id] = { 
    id, 
    email, 
    password 
  };
  res.cookie('user_id', id);

  res.redirect('/urls'); // eventually /urls
})

// Catch-all
app.get('*', (req, res) => {
  response.status(404).send('This page doesn\'t exist');
});

//
//
//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});