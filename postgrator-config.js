require('dotenv').config();
// const Postgrator = require('postgrator');
// new Postgrator({
//   validateChecksums:false
// });
module.exports = {
  'migrationsDirectory': 'migrations',
  'driver': 'pg',
  validateChecksums:false,
  'connectionString': (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DB_URL
    : process.env.DB_URL,
};