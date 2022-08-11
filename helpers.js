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
}



module.exports = {
  getUserByEmail,
}