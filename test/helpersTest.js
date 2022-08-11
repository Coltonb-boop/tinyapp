const { assert } = require('chai');

const { getUserByEmail } = require('../helpers');

const testUsers = {
  aaaaaa: {
    id: "aaaaaa",
    email: "user@example.com",
    password: "purple",
  }
}

describe('getUserByEmail', () => {
  it('should return a user with a valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserId ='aaaaaa';
    assert.equal(user.id, expectedUserId);
  });

  it('should return null with an invalid email', () => {
    const user = getUserByEmail('notreal@example.com', testUsers);
    const expectedUserId = null;
    assert.equal(user, expectedUserId);
  });
})