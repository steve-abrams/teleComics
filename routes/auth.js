var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var bcrypt= require('bcrypt');
var comics = db.get('comics');
var transcomics = db.get('transcomics');
var helpers = require('../lib/logic');

router.get('/teleComics/signup', function(req, res, next) {
   res.render('users/signup', { messages: req.flash('info') });
});

router.post('/teleComics/signup', function(req, res, next){
  var hash=bcrypt.hashSync(req.body.password, 8);
  users.findOne({email: req.body.email}).then(function (user) {
    if (user && !user.password) {
      console.log('user exists no PW')
      var errorlist=(helpers.loginvalidate('asdf', req.body.password, user));
      if(errorlist.length >0){
        res.render('users/signup', {errorlist: errorlist});
      } else {
          users.update({_id: user._id}, {$set: {password: hash}}).then(function (data) {
            req.session.user=req.body.email;
            req.session.uId=user._id;
            findUnreadByUser(user).then(function (unread) {
              console.log(unread, " number unread")
              req.session.unreadCount = unread
              res.redirect("/");
            })
          });
        }
    } else {
      console.log('user does not exist')
      users.find({}, function(err, data){
      var errorlist=(helpers.loginvalidate(req.body.email, req.body.password, data));
      if(errorlist.length >0){
        res.render('users/signup', {errorlist: errorlist});
      } else {
        users.insert({email:req.body.email, password:hash}).then(function (data) {
          req.session.user=req.body.email;
          req.session.uId=data._id;
          res.redirect('/');
        });
      }
    })
    }
  });
});

router.post('/teleComics/login', function(req, res, next){
  users.findOne({email:req.body.email}, function(err, data){
    if(data && data.password){
      var compare=data.password;
      var user=data.email;
      var statement;
      if (bcrypt.compareSync(req.body.password, compare)){
        req.session.user=req.body.email;
        req.session.uId=data._id;
        if (data.received) {
          findUnreadByUser(data).then(function (unread) {
            console.log(unread, " number unread")
            req.session.unreadCount = unread
            res.redirect("/");
          })
        } else {
          res.redirect('/');
        }
      }else{
        var comicMaster = {};
        transcomics.find({owner: req.session.uId}).then(function (telecomics) {
          var comicIds = telecomics.map(function (comic) {
            return comic.comicId
          })
          var promiseArray = []
          comicIds.forEach(function (comicId) {
            promiseArray.push(comics.findOne({_id: comicId}))
          })
          comicMaster = telecomics
          return Promise.all(promiseArray)
        }).then(function (comicsArray) {
          comicMaster.forEach(function (ele, i) {
            ele.panes = comicsArray[i].panes
          })
          statement="Email or password is incorrect.";
          res.render('users/login', {comics: comicMaster, statement:statement});
        })
      }
    }
    else{
      var comicMaster = {};
      transcomics.find({owner: req.session.uId}).then(function (telecomics) {
        var comicIds = telecomics.map(function (comic) {
          return comic.comicId
        })
        console.log(comicIds, "telefind!")
        var promiseArray = []
        comicIds.forEach(function (comicId) {
          promiseArray.push(comics.findOne({_id: comicId}))
        })
        comicMaster = telecomics
        return Promise.all(promiseArray)
      }).then(function (comicsArray) {
        comicMaster.forEach(function (ele, i) {
          ele.panes = comicsArray[i].panes
        })
        console.log(comicMaster, "comicfind")
        var message="Email or password is incorrect.";
        res.render('users/login', {comics: comicMaster, message:message});
      })
    }
  });
});

router.post('/teleComics/logout', function(req, res, next) {
  req.session=null;
  res.redirect('/');
});

function findUnreadByUser(user) {
  return new Promise(function (success, fail) {
    console.log(user)
    transcomics.find({_id: {$in: user.received}}).then(function (transcomics) {
      console.log(transcomics)
      var unread = 0
      transcomics.forEach(function (comic) {
        comic.unread.forEach(function (entry) {
          if (entry.email === user.email && !entry.read) {
            unread++
          }
        })
      })
      console.log('success line')
      success(unread)
    })
  })
}

module.exports = router;
