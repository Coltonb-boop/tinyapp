/* Module devoted to helper functions
 */

//
/**
 * Lookup a user in a specific database
 * @param {*} email
 * @param {*} database
 * @returns user object or null
 */
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }

  return null;
};

/**
 * Finds a specific users shortURLs
 * @param {*} user
 * @returns object of urls
 */
const urlsForUser = (user, database) => {
  let urls = {};
  // find this users shortURLs
  for (let url in database) {
    if (database[url].userID === user) {
      urls[url] = database[url];
    }
  }

  return urls;
};

/**
 * Receives string of characters to make a random string from or uses a default
 * @param {*} strLength custom length of string
 * @param {*} characters custom string characters, otherwise uses default
 * @returns string of random characters
 */
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



module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
};