var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/teleComics');
var users = db.get('users');
var bcrypt= require('bcrypt');
/* GET home page. */

router.get('/', function(req, res, next) {
  console.log(res.locals);
  res.render('users/login');
});





module.exports = router;
