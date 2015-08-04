var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');


var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var comics = db.get('comics');
var transcomics = db.get('transcomics');
var helpers = require('../lib/logic');

router.get('/', function(req, res, next) {
  var comicMaster = {};
  if (!req.session.uId) {
    transcomics.find().then(function (telecomics) {
      var comicIds = telecomics.map(function (comic) {
        return comic.comicId;
      });
      var promiseArray = [];
      comicIds.forEach(function (comicId) {
        promiseArray.push(comics.findOne({_id: comicId}));
      });
      console.log(comicIds);
      comicMaster = telecomics;
      return Promise.all(promiseArray);
    }).then(function (comicsArray) {
      console.log(comicsArray);
      comicMaster.forEach(function (ele, i) {
        ele.panes = comicsArray[i].panes
      });
      console.log(comicMaster, "comicfind")
      comicMaster.reverse()
      comicMaster = comicMaster.splice(0,25)
      res.render('users/login', {comics: comicMaster});
    })
  } else {
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
  }
});

router.get('/telecomics/received', function (req, res, next) {
  users.findOne({_id: req.session.uId}).then(function (user) {
    if (!user.received || user.received.length < 1){
      console.log('hello')
      res.render('received', {empty: true})
    }
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
      res.render('received', {comics: comicMaster});
    });
  });
});

router.get('/telecomics/:id/public', function (req, res, next) {
  var comicMaster;
  transcomics.findOne({_id: req.params.id}).then(function (transcomic) {
    // console.log(transcomic);
    comicMaster = transcomic;
    return comics.findOne({_id: transcomic.comicId});
  }).then(function (comic) {
    // console.log(comic);
    comicMaster.panes = comic.panes;
    comicMaster.title = comic.title;
    console.log(comicMaster)
    res.render('show', {comic:comicMaster,
      panes: comicMaster.panes,
      blurbs: comicMaster.blurbs,
      panes: comicMaster.panes,
      languages:comicMaster.languages});
  });
});

router.get('/telecomics/feed', function (req, res, next) {
  transcomics.find().then(function (telecomics) {
    var comicIds = telecomics.map(function (comic) {
      return comic.comicId;
    });
    var promiseArray = [];
    comicIds.forEach(function (comicId) {
      promiseArray.push(comics.findOne({_id: comicId}));
    });
    console.log(comicIds);
    comicMaster = telecomics;
    return Promise.all(promiseArray);
  }).then(function (comicsArray) {
    console.log(comicsArray);
    comicMaster.forEach(function (ele, i) {
      ele.panes = comicsArray[i].panes
    });
    console.log(comicMaster, "comicfind")
    comicMaster.reverse()
    comicMaster = comicMaster.splice(0,25)
    res.render('feed', {comics: comicMaster});
  })
})

module.exports = router;
