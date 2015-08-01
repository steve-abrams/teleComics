var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var paneCollection = db.get('panes');
var blurbs = db.get('blurbs');
var comics = db.get('comics');
var helpers = require('../lib/logic');

router.get('/', function(req, res, next) {
  console.log(res.locals);
  res.render('users/login');
});

module.exports = router;
