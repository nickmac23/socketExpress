var express = require('express');
var router = express.Router();
var io = require('../lib/io')


router.get('/', function (req, res, next) {
  res.render('index')
})

module.exports = router;
