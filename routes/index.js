var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');


var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var comics = db.get('comics');
var transcomics = db.get('transcomics')
var helpers = require('../lib/logic');

router.get('/', function(req, res, next) {
  // console.log(req.session)
  // res.render('users/login')
  var comicMaster = {};
  comics.find({owner_id: req.session.uId}).then(function (comics) {
    var comicIds = comics.map(function (comic) {
      return comic._id.toString()
    })
    //console.log(comicIds)
    comicMaster = comics;
    return transcomics.find({comicId: {$in: comicIds}})
  }).then(function (transcomicsArray) {
    comicMaster.forEach(function (comic, i) {
      comic.blurbs = transcomicsArray[i].blurbs;
    })
    comicMaster.reverse()
    //console.log('in trans!', comicMaster);
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
    console.log(transpromises);
    Promise.all(transpromises).then(function (comicMaster) {
      console.log(comicMaster);
      // then(function(comic) {
      //   console.log(comic);
      //   comicMaster[i] = comic;
      for (var i = 0; i < transcomicsArray.length; i++) {
        comicMaster[i].blurbs = transcomicsArray[i].blurbs;
      }

      //});
      comicMaster.reverse();
      console.log('in trans!', comicMaster);
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
