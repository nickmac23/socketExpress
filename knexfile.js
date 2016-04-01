// Update with your config settings.
var dbURL = process.DATABASE_URL || 'postgres://localhost/sockmsg'
module.exports = {
  development: {
    client: 'postgresql',
    connection: 'postgres://localhost/sockmsg'
  },
  production: {
    client: 'postgresql',
    connection: {
      host     : 'ec2-54-243-243-89.compute-1.amazonaws.com',
      user     : process.env.PG_HEROKU_USER,
      password : process.env.PG_HEROKU_PASS,
      database : process.env.PG_HEROKU_DB,
      port: process.env.PG_HEROKU_PORT
    }
  }
};
