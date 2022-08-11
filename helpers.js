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



module.exports = {
  getUserByEmail,
  urlsForUser,
};