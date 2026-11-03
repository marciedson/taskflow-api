const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  if (passwordHash.startsWith('$2')) {
    return bcrypt.compare(password, passwordHash);
  }

  return passwordHash === password;
}

module.exports = { hashPassword, verifyPassword };
