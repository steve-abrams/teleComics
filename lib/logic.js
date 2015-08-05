var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var bcrypt= require('bcrypt');
var comics = db.get('comics');
var transcomics = db.get('transcomics');

var bt = require('bing-translate').init({
    client_id: process.env.TRANSLATE_ID,
    client_secret: process.env.TRANSLATE_SECRET
  });

var languages = ['hi', 'ro', 'ar', 'bg', 'ca', 'nl', 'et', 'fr', 'he', 'mww',
 'id', 'ja', 'tlh', 'ko', 'lv', 'mt', 'pl', 'pt', 'otq', 'sk', 'sv']

var languageKey = {
  hi: 'Hindi',
  ro: 'Romanian',
  ar: 'Arabic',
  bg: 'Bulgarian',
  ca: 'Catalan',
  nl: 'Dutch',
  et: 'Estonian',
  fr: 'French',
  he: 'Hebrew',
  mww: 'Hmong Daw',
  id: 'Indonesian',
  ja: 'Japanese',
  tlh: 'Klingon',
  ko: 'Korean',
  lv: 'Latvian',
  mt: 'Maltese',
  pl: 'Polish',
  pt: 'Portugese',
  otq: 'Querétaro Otomi',
  sk: 'Slovak',
  sv: 'Swedish'
}

var helpers = {
  createPanes: function (body) {
    var panes = [];
    var pane1 = {};
    var pane2 = {};
    var pane3 = {};
    pane1.imageSource = body.pane1;
    pane2.imageSource = body.pane2;
    pane3.imageSource = body.pane3;
    pane1.comment = body.comment1;
    pane2.comment = body.comment2;
    pane3.comment = body.comment3;
    panes.push(pane1);
    panes.push(pane2);
    panes.push(pane3);
    return panes;
  },

  validateComic: function (body) {
    var errors = []
    if (body.pane1.trim() === "") {
      errors.push("First Pane cannot be blank")
    }
    if (body.pane2.trim() === "") {
      errors.push("Second Pane cannot be blank")
    }
    if (body.pane3.trim() === "") {
      errors.push("Third Pane cannot be blank")
    }
    if (body.comment1.trim() === "") {
      errors.push("First Comment cannot be blank")
    }
    if (body.comment2.trim() === "") {
      errors.push("Second Comment cannot be blank")
    }
    if (body.comment3.trim() === "") {
      errors.push("Third Comment cannot be blank")
    }
    if (body.title.trim() === "") {
      errors.push("Title cannot be blank")
    }
    return errors
  },

  telephoneTranslate: function (comment) {
    var master = {}
    master.languageRoute = []
    return new Promise(function(success, error) {
      oneTranslate(comment, 'en', randomLanguage()).then(function (record) {
        master.languageRoute.push(record.to_language)
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        master.languageRoute.push(record.to_language)
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        master.languageRoute.push(record.to_language)
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        master.languageRoute.push(record.to_language)
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        master.languageRoute.push(record.to_language)
        return oneTranslate(record.translated_text, record.to_language, 'en')
      }).then(function (record) {
        master.blurb = record.translated_text
        master.languageRoute = languageRender(master.languageRoute)
        success(master)
      })
    })
  },

  emailArray: function (string) {
    var str = /\r/g
    var array = string.replace(str,'').split('\n')
    return array
  },

  validateEmails: function (array) {
    console.log(array)
    for (var i = 0; i < array.length; i++) {
      console.log(array[i])
      if(!validateEmail(array[i])) {
        return "Not all emails entered are valid"
      }
    }
  },

  findBlurb: function (array, date) {
    for (var i = 0; i < array.length; i++) {
      if(array[i].date.toString() === date.toString()){
        console.log('win')
        return array[i]
      }
    }
  },

   loginvalidate: function (newemail, password, data) {
    console.log('IN LOGINVAL')
    var output=[];
    for(var i=0; i < data.length; i++){
      if(data[i].email.trim().toLowerCase() === newemail.trim().toLowerCase()){
        output[0] = "Email already exists";
      }
    }
    if(password.trim().length < 6){
     output.push("Password must be longer than 5 characters");
    }
    return output;
  },
};



function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}


var randomLanguage = function () {
  return languages[(Math.floor(Math.random()*languages.length))]
}

var oneTranslate =  function (comment, inLang, out) {
  return new Promise(function (succes, error) {
    bt.translate(comment, inLang, out, function (err, record) {
      succes(record)
    })
  })
}

var languageRender = function (array) {
  for (var i = 0; i < array.length; i++) {
    array[i] = languageKey[array[i]];
  }
  return array;
};



module.exports = helpers;
