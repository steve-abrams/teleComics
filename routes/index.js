var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');


var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var comics = db.get('comics');
var transcomics = db.get('transcomics')
var helpers = require('../lib/logic');

router.get('/', function(req, res, next) {
  console.log(req.session)
  // res.render('users/login')
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
    res.render('users/login', {comics: comicMaster});
  })
});

router.get('/telecomics/recieved', function (req, res, next) {
  users.findOne({_id: req.session.uId}).then(function (user) {
   return transcomics.find({_id:{$in:user.received}});
  }).then(function (transcomicsArray) {
    var transpromises = transcomicsArray.map(function (transcomic, i) {
      return comics.findOne({_id:transcomic.comicId});
    });
    Promise.all(transpromises).then(function (comicMaster) {
      for (var i = 0; i < transcomicsArray.length; i++) {
        comicMaster[i].blurbs = transcomicsArray[i].blurbs;
        comicMaster[i]._id = transcomicsArray[i]._id;
      }
      comicMaster.reverse();
      res.render('recieved', {comics: comicMaster});
    });
  });
});

//INDEX (home page)


// router.get('/telecomics',function (req, res, next) {
//   res.render('index');
// })
//
// //NEW
// router.get('/telecomics/new', function (req, res, next) {
//   res.render('new');
// })
//
// //CREATE
// router.post('/telecomics', function (req, res, next) {
//   var errors = helpers.validateComic(req.body);
//   if (errors.length > 0){
//     res.render("new", {errors: errors, data: req.body})
//   }
//   var panes = helpers.createPanes(req.body)
//   paneCollection.insert(panes).then(function (panes) {
//     var comic = {};
//     comic.title = req.body.title;
//     panes = panes.map(function (pane) {
//       return pane._id;
//     })
//     comic.panes = panes;
//     comic.date = Date.now();
//     comics.insert(comic).then(function (comic) {
//       res.redirect('/telecomics');
//     })
//   });
// })

module.exports = router;
