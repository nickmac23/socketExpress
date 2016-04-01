var environment = process.env.ENVIRONMENT;
var config = require('../knexfile.js')[environment];
module.exports = require('knex')(config);
