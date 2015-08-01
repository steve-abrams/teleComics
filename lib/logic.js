var bt = require('bing-translate').init({
    client_id: process.env.TRANSLATE_ID, 
    client_secret: process.env.TRANSLATE_SECRET
  });
  
var languages = ['hi', 'ro', 'ar', 'bg', 'ca', 'nl', 'et', 'fr', 'he', 'mww',
 'id', 'ja', 'tlh', 'ko', 'lv', 'mt', 'pl', 'pt', 'otq', 'sk', 'sv']

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
    pane1.blurbs = [];
    pane2.blurbs = [];
    pane3.blurbs = [];
    return panes
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
    return new Promise(function(success, error) {
      oneTranslate(comment, 'en', randomLanguage()).then(function (record) {
        // console.log('in 1', record.translated_text)
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        return oneTranslate(record.translated_text, record.to_language, randomLanguage())
      }).then(function (record) {
        return oneTranslate(record.translated_text, record.to_language, 'en')
      }).then(function (record) {
        // console.log(record.translated_text)
        success(record.translated_text)
      })
    })
  },
  
  emailArray: function (string) {
    var array = string.replace('\r','').split('\n')
    return array
  },
  
  findBlurb: function (array, date) {
    for (var i = 0; i < array.length; i++) {
      if(array[i].date.toString() === date.toString()){
        console.log('win')
        return array[i]
      }
    }
  }
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

module.exports = helpers
