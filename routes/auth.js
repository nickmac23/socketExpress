'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const flash = require('flash');
const knex = require('../db/knexs');
const Users = function() { return knex('users') };

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
