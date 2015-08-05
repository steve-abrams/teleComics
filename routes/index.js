var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');


var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var comics = db.get('comics');
var transcomics = db.get('transcomics');
var helpers = require('../lib/logic');
var sendgrid = require('sendgrid')(process.env.SENDGRIDAPIKEY);

router.get('/', function(req, res, next) {
  console.log(res.locals)
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
      // console.log(comicIds);
      comicMaster = telecomics;
      return Promise.all(promiseArray);
    }).then(function (comicsArray) {
      // console.log(comicsArray);
      comicMaster.forEach(function (ele, i) {
        ele.panes = comicsArray[i].panes
      });
      // console.log(comicMaster, "comicfind")
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
      // console.log(comicIds, "telefind!")
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
      // console.log(comicMaster, "comicfind")
      res.render('users/login', {comics: comicMaster});
    })
  }
});

router.get('/telecomics/received', function (req, res, next) {
  users.findOne({_id: req.session.uId}).then(function (user) {
    clearUnread(user)
    req.session.unreadCount = 0;
    if (!user.received || user.received.length < 1){
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

router.get('/telecomics/reset/:id', function (req, res, next) {
  var userId = req.params.id.split('-')[0];
  var token = req.params.id.split('-')[1];
  var time = Date.now()
  console.log(token, "is token", time, 'is time')
  if (Number(token)+300000 > Number(time)) {
    console.log(userId)
    users.update({_id: userId}, {$unset: {password: ''}}).then(function () {
      console.log('pw reset')
      req.session = null;
      res.redirect('/telecomics/signup');
    })
  }
  else {
    res.render('users/reset', {message: 'That token has expired, please resubmit your request.'})
  }
})

router.get('/telecomics/password/reset', function (req, res, next) {
  res.render('users/reset')
})

router.post('/telecomics/password/reset', function (req, res, next) {
  console.log('in reset post', req.body)
  users.findOne({email: req.body.email}).then(function (user) {
    if (!user){
      req.flash('info', 'Email not found, please try to reset password again');
      res.redirect('/telecomics/signup')
    } else {
      console.log(user)
      var dateComponent = Date.now()
      var token = user._id+'-'+dateComponent
      console.log(token)
      var email = new sendgrid.Email({
        from: 'rememberYourPasswordNoob@telecomics.com',
        to: user.email,
        subject:  'TeleComics Password Reset',
        text:     'Reset your telecomic password online at /telecomics/reset/'+token
      });
      email.setHtml('<p>Reset your TeleComics password:</p><p><a href="'+process.env.HOST+'/telecomics/reset/'+token+'">Reset Password</a></p>')
      console.log(email)
      sendgrid.send(email, function(err, json) {
        if (err) { return console.error(err); }
        console.log(json);
      });
      req.flash('info', 'An email has been sent with a link to reset your password');
      res.redirect('/telecomics/signup')
    }
  })
})

function clearUnread(user) {
  return new Promise(function (success, fail) {
    // console.log(user)
    transcomics.find({_id: {$in: user.received}}).then(function (transcomicsArray) {
      // console.log(transcomics)
      var unread = 0
      promiseArray = []
      transcomicsArray.forEach(function (comic) {
        var tempUnread = comic.unread;
        comic.unread.forEach(function (entry, i) {
          if (entry.email === user.email && !entry.read) {
            console.log(tempUnread[i], '***************')
            tempUnread[i].read = true;
            console.log(tempUnread, 'after')
            promiseArray.push(transcomics.update({_id: comic._id}, {$set: {unread: tempUnread}}))
          }
        })
      })
      console.log(promiseArray)
      Promise.all(promiseArray).then(function (records) {
        console.log(records, '!!!!!!!!!!!!')
      })
    })
  })
}

module.exports = router;
