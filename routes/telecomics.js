var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var comics = db.get('comics');
var transcomics = db.get('transcomics');
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
  res.render('new');
})

//CREATE
router.post('/telecomics', function (req, res, next) {
  var comicMaster
  var errors = helpers.validateComic(req.body);
  if (errors.length > 0){
    res.render("new", {errors: errors, data: req.body});
  }
  var panes = helpers.createPanes(req.body);
  comics.insert({title:req.body.title, panes:panes, owner_id:req.session.uId}).then(function (comic) {
    comicMaster = comic
    users.update({_id: req.session.uId}, {$push: {created: comic._id}})
    res.redirect('/telecomics/'+comicMaster._id+'/preview');
  })
});


router.get('/telecomics/:id/preview', function (req, res, next) {
  comics.findOne({_id: req.params.id}).then(function (comic) {

    res.render('preview', {comic: comic});
  });
});

router.post('/telecomics/:id/send',function (req, res, next) {
  var emails = helpers.emailArray(req.body.recipients);
  var error = helpers.validateEmails(emails);
  // console.log(error, '!', emails)
  if(error){
    comics.findOne({_id: req.params.id}).then(function (comic) {
      res.render('preview', {error:error, comic:comic});
    });
  }else{
  comics.findOne({_id:req.params.id}).then(function (comic) {
    var paneBlurbs = [];
    for (var i = 0; i < comic.panes.length; i++) {
      paneBlurbs.push(helpers.telephoneTranslate(comic.panes[i].comment));
    }
    Promise.all(paneBlurbs).then(function (blurbs) {

      return transcomics.insert({comicId: req.params.id, sentTo: emails, date: Date.now(), blurbs: blurbs});
    }).then(function (record) {
      var userCreate = [];
      record.sentTo.forEach(function (email) {
        userCreate.push(users.update({email: email}, {$set: {email: email}}, {upsert:true}))
      })
      Promise.all(userCreate).then(function () {
        // console.log('helo', record._id, record.sentTo)
        users.update({email: {$in: record.sentTo}}, {$push: {received: record._id}}, {multi: true})
      })
      users.update({_id: req.session.uId}, {$push: {sent: record._id}})
      res.redirect('/telecomics/'+record._id);
    });
  });
}
});

router.get('/telecomics/:id', function (req, res, next) {
  var comicMaster;
  transcomics.findOne({_id: req.params.id}).then(function (transcomic) {
    // console.log(transcomic);
    comicMaster = transcomic;
    return comics.findOne({_id: transcomic.comicId});
  }).then(function (comic) {
    // console.log(comic);
    comicMaster.panes = comic.panes;
    // console.log(comicMaster);
    res.render('show', {comic:comicMaster, panes: comicMaster.panes, blurbs: comicMaster.blurbs});
  });
});

router.get('/telecomics/:id/edit', function(req, res, next) {
  comics.findOne({_id: req.params.id}).then(function (comic) {
    var data = {
      title: comic.title,
      pane1: comic.panes[0].imageSource,
      pane2: comic.panes[1].imageSource,
      pane3: comic.panes[2].imageSource,
      comment1: comic.panes[0].comment,
      comment2: comic.panes[1].comment,
      comment3: comic.panes[2].comment,
    };
    res.render('edit', {data: data, id:req.params.id});
  });
});

router.post('/telecomics/:id/delete', function (req, res, next) {
  comics.remove({_id:req.params.id});
  res.redirect('/');
});

  module.exports=router;
