var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var paneCollection = db.get('panes');
var blurbCollection = db.get('blurbs');
var comics = db.get('comics');
var helpers = require('../lib/logic');

var bt = require('bing-translate').init({
    client_id: process.env.TRANSLATE_ID, 
    client_secret: process.env.TRANSLATE_SECRET
  });
 
// bt.translate('This hotel is located close to the centre of Paris.', 'en', 'ro', function(err, res){
//   console.log(err, res);
// });
// 



router.get('/telecomics',function (req, res, next) {
  res.render('index');
})

//NEW
router.get('/telecomics/new', function (req, res, next) {
  helpers.telephoneTranslate('The quick brown fox jumped over the lazy dog').then(function (blurb) {
    console.log(blurb)
  })
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
    // console.log('in comic find')
    return paneCollection.find({_id: {$in: comic.panes}})
  }).then(function (panes) {
    // console.log(panes)
    res.render('preview', {comic:comicMaster, panes: panes})
  })
})

router.post('/telecomics/:id/send',function (req, res, next) {
  var paneMaster
  var dateMaster = Date.now()
  var recipients = helpers.emailArray(req.body.recipients)
  comics.findOne({_id:req.params.id}).then(function (comic) {
    console.log('Comic Found');
    return paneCollection.find({_id: {$in: comic.panes}})
  }).then(function (panes) {
    paneMaster = panes
    console.log('panes found')
    var paneBlurbs = [];
    for (var i = 0; i < panes.length; i++) {
      paneBlurbs.push(helpers.telephoneTranslate(panes[i].comment));
    }
    Promise.all(paneBlurbs).then(function (blurbs) {
      var blurbObjects = blurbs.map(function (blurb) {
        var object = {};
        object.blurb = blurb;
        object.date = dateMaster;
        return object
      })
      console.log(blurbs)
      // console.log(blurbObjects)
      return blurbCollection.insert(blurbObjects)
    }).then(function (blurbs) {
      // console.log(paneMaster[0]._id, 'aofheoahfsoudhfouasdhfouhasoufh')
      return Promise.all([
        paneCollection.update({_id: paneMaster[0]._id},{$push: {blurbs: blurbs[0]._id}}),
        paneCollection.update({_id: paneMaster[1]._id},{$push: {blurbs: blurbs[1]._id}}),
        paneCollection.update({_id: paneMaster[2]._id},{$push: {blurbs: blurbs[2]._id}})])
    }).then(function () {
      var sentObj = {}
      sentObj.date = dateMaster;
      sentObj.recipients = recipients;
      return comics.update({_id: req.params.id},{$push: {sent: sentObj}})
    }).then(function (record) {
      console.log('comic updated', record)
      res.redirect('/telecomics/'+req.params.id+'/'+dateMaster)
    })
  })
})

router.get('/telecomics/:id/:date', function (req, res, next) {
  var comicMaster
  comics.findOne({_id: req.params.id}).then(function (comic) {
    comicMaster = comic
    return paneCollection.find({_id: {$in: comic.panes}})
  }).then(function (panes) {
    comicMaster.panes = panes
    // console.log(req.params.date)
    return Promise.all([
      blurbCollection.find({_id:{$in: panes[0].blurbs}}),
      blurbCollection.find({_id:{$in: panes[1].blurbs}}),
      blurbCollection.find({_id:{$in: panes[2].blurbs}}),
    ])
  }).then(function (blurbs) {
    blurbs = blurbs.map(function (blurbArray) {
      console.log(blurbArray)
      return helpers.findBlurb(blurbArray, req.params.date)
    })
    console.log(blurbs)
    res.render('show', {comic:comicMaster, panes: comicMaster.panes, blurbs: blurbs})
  })
})

module.exports=router