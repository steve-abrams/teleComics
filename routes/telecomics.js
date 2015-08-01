var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var paneCollection = db.get('panes');
var blurbs = db.get('blurbs');
var comics = db.get('comics');
var helpers = require('../lib/logic');




router.get('/telecomics',function (req, res, next) {
  res.render('index');
})

//NEW
router.get('/telecomics/new', function (req, res, next) {
  res.render('new');
})

//CREATE
router.post('/telecomics', function (req, res, next) {
  var errors = helpers.validateComic(req.body);
  if (errors.length > 0){
    res.render("new", {errors: errors, data: req.body})
  }
  var panes = helpers.createPanes(req.body)
  paneCollection.insert(panes).then(function (panes) {
    var comic = {};
    comic.title = req.body.title;
    panes = panes.map(function (pane) {
      return pane._id;
    })
    comic.panes = panes;
    comic.date = Date.now();
    comic.owner = req.session.uId;
    comics.insert(comic).then(function (comic) {
      res.redirect('/telecomics/'+comic._id+'/preview');
    })
  });
})

router.get('/telecomics/:id/preview', function (req, res, next) {
  var comicMaster
  comics.findOne({_id: req.params.id}).then(function (comic) {
    comicMaster = comic
    console.log('in comic find')
    return paneCollection.find({_id: {$in: comic.panes}})
  }).then(function (panes) {
    console.log(panes)
    res.render('preview', {comic:comicMaster, panes: panes})
  })
})

module.exports=router