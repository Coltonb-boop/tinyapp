const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { response } = require('express');

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  aaaaa: {
    id: "aaaaa",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
}

// Helper functions
// user lookup, takes in email to search for and returns user from users object
const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }

  return null;
}

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

// Endpoint for logging in. Checks user credentials and stores 
// user_id in a cookie and redirects to /urls
app.post('/login', (req, res) => {
  if (req.cookies.user_id) { // if someone is logged in already
    res.redirect('/urls');
    return;
  }
  
  const { email, password } = req.body;
  let userFromDatabase = getUserByEmail(email);

  if (!userFromDatabase) {
    res.status(403).send('Couldn\'nt find a user with that email');
    return;
  }

  if (email !== userFromDatabase.email || password !== userFromDatabase.password) {
    res.status(403).send("Incorrect email or password");
    return;
  }

  res.cookie('user_id', userFromDatabase.id);
  res.redirect('/urls');
});

// Endpoint for logging out. Currently deletes user cookie and redirects to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');
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
    users,
    urls: urlDatabase,
    userId: req.cookies['user_id']
  };

  res.render('urls_index', templateVars);
});

// Catches a user trying to use a shortURL to get to the longURL
app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id];

  res.redirect(longURL);
});

// Endpoint for developers to see the json database
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Endpoint for /urls. Simply loads the list of stored URLs
app.get('/urls', (req, res) => {
  const templateVars = {
    users,
    urls: urlDatabase,
    userId: req.cookies['user_id']
  };
  
  res.render('urls_index', templateVars);
});

// Endpoint for the create new shortURL page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: req.cookies['user_id']
  };

  res.render('urls_new', templateVars);
});

// Endpoint for looking at a specific shortURL
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    users,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: req.cookies['user_id']
  };

  res.render('urls_show', templateVars);
});

// Endpoint for user login
app.get('/login', (req, res) => {
  const templateVars = {
    users,
    userId: req.cookies['user_id']
  }

  res.render('urls_login', templateVars);
});

// Endpoint for user registration
app.get('/register', (req, res) => {
  const templateVars = {
    users,
    userId: req.cookies['user_id']
  }

  res.render('urls_register', templateVars);
});

// Catchall
app.get('*', (req, res) => {
  response.status(404).send('This page doesn\'t exist');
});

//
//
//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});