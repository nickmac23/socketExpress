var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('public/index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {

  res.render('public/login');
});
router.get('/signup', function(req, res, next) {

  res.render('public/signup');
});

module.exports = router;
