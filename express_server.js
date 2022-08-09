const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

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
}

// Middleware
app.use(express.urlencoded( {extended: true }));


// Endpoints
app.post('/urls', (req, res) => {
  // console.log('from post /urls', req.body);
  let newShort = generateRandomString()
  urlDatabase[newShort] = req.body.longURL;

  const templateVars = { id: newShort, longURL: req.body.longURL };

  res.render('urls_show', templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
})

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
const inspect = require('util').inspect;
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