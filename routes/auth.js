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

  return done(null, {
                      googleId: profile.id,
                      displayName: profile.displayName,
                      gender: profile.gender,
                      profileImageURL: profile._json.image.url,
                      photos: profile.photos,
                      imageUrl:profile._json.image.url,
                      email: profile.emails[0].value
                    });
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

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home and add current user key to database.
    Users().where({email: req.user.email.toLowerCase()}).first().then(function(user){
      var toUpdate = {};

      if(user && !user.google_id) toUpdate.google_id = req.user.googleId;
      if(user && !user.image_url) toUpdate.image_url = req.user.imageUrl;
      if(Object.keys(toUpdate).length === 0){
        req.session.userID = user.id;
        return res.redirect('/');
      }

      if(user){
        console.log('in update');
        Users().update(toUpdate).where({id: user.id}).then(function(){
          req.session.userID = user.id;
          return res.redirect('/');
        })
      }else{
        Users().insert({
                        email: req.user.email.toLowerCase(),
                        name: req.user.displayName,
                        google_id: req.user.google_id,
                        image_url: req.user.imageUrl
                      }).then(function(){
                        req.session.userID = user.id;
                        res.redirect('/');
                      })
      }
    })

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
                req.session.userID = user.id;
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
            req.session.userID = user.id;
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });
});

module.exports = router;
