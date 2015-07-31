var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/teleComics/signup', function(req, res, next) {
   res.render('users/signup');
});

module.exports = router;
