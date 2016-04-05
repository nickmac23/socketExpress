'use strict';
const express = require('express');
const router = express.Router();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

const bcrypt = require('bcrypt');
const flash = require('flash');
const knex = require('../db/knexs');
const Users = function() { return knex('users') };

router.use(cookieSession({
  name: 'session',
  keys: [
    process.env.SESSION_KEY1,
    process.env.SESSION_KEY2,
    process.env.SESSION_KEY3
  ]
}))

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.HOST + "/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);

  return done(null, {displayName: profile.displayName, gender: profile.gender,
                   profileImageURL: profile._json.image.url, photos: profile.photos,
                   url:profile._json.image.url});
}
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


router.use(passport.initialize());
router.use(passport.session());

router.get('/google', passport.authenticate('google', {scope: ['profile']}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home and add current user key to database.
    console.log(req.user);
    res.redirect('/');
  });

router.post('/signup', function(req, res, next) {
    req.body.email = req.body.email.toLowerCase();
    Users().where({
        email: req.body.email
    }).first().then(function(user) {
        let salt = bcrypt.genSaltSync(10);
        if (!user) {
            let hash = bcrypt.hashSync(req.body.password, 10);
            Users().insert({
                name: req.body.name,
                email: req.body.email,
                password: hash,
            }).then(function(){
              return Users().where('email', req.body.email).first().then(function(user){
                res.cookie('userID', user.id, {
                  signed: true
                });
              })
            }).then(function(){
              res.redirect('/');
            });
        } else {
            res.redirect('/login');
        }
    });
});

router.post('/login', function(req, res, next) {
  console.log(req.body);
    Users().where({
        email: req.body.email,
    }).first().then(function(user) {
        let hashed_pw = bcrypt.hashSync(req.body.password, 10);
        if (user && bcrypt.compareSync(req.body.password, hashed_pw)) {
            res.cookie('userID', user.id, {
                signed: true
            });
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });
});

router.get('/logout', function(req, res) {
    res.clearCookie('userID');
    req.flash('info', 'Goodbye!');
    res.redirect('/');
});

module.exports = router;
