var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var knex = require('./db/knexs');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

var bodyParser = require('body-parser');
const Users = function() { return knex('users') };

var routes = require('./routes/public');
var users = require('./routes/users');
var rooms = require('./routes/rooms');
var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SECRET));
app.use(cookieSession({
  name: 'session',
  keys: [
    process.env.SESSION_KEY1,
    process.env.SESSION_KEY2,
    process.env.SESSION_KEY3
  ]
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  console.log(req.session.userID);
  Users().where('id', req.session.userID).first().then(function(user){
    res.user = user;
    res.locals.user = user;
    next();
  })
});

app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);

app.use(function(req, res, next){
  if(res.user) return next();
  res.redirect('/login');
});

app.use('/rooms', rooms);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
