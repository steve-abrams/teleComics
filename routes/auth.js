var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var bcrypt= require('bcrypt');


router.get('/teleComics/signup', function(req, res, next) {
   res.render('users/signup');
});

router.post('/teleComics/signup', function(req, res, next){
  var hash=bcrypt.hashSync(req.body.password, 8);
  users.findOne({email: req.body.email}).then(function (user) {
    if (user && !user.password) {
      console.log(user);
        users.update({_id: user._id}, {$set: {password: hash}})

    } else {
      users.insert({email:req.body.email, password:hash});
    }
  });
  res.redirect('/');
});

router.post('/teleComics/login', function(req, res, next){
  users.findOne({email:req.body.email}, function(err, data){
    if(data){
      req.session.user=req.body.email;
      req.session.uId=data._id
      var compare=data.password;
      var user=data.email;
      var statement;
      if (bcrypt.compareSync(req.body.password, compare)){
        //res.cookie('currentuser', name);
        res.redirect("/");
      }else{
        statement="Password does not match";
        res.render("users/login", {statement:statement});
      }
    }
    else{
      var message="Email does not exist";
      res.render("users/login", {message:message});
    }

  });
});

router.post('/teleComics/logout', function(req, res, next) {
  req.session=null;
  res.redirect('/');
});

module.exports = router;
