var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var flash = require('connect-flash');
var sendgrid = require('sendgrid')('telecomics', 'juststeveit1');

require('dotenv').load();

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var telecomics = require('./routes/telecomics');

var app = express();
app.set('trust proxy', 1);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2, process.env.SESSION_KEY3]
}))
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
var setEmailLocal = function (req, res, next) {
  res.locals.currentUser = req.session.user;
  res.locals.unreadCount = req.session.unreadCount;
  console.log(res.locals);
  next();
};

app.use(setEmailLocal);

app.use('/', routes);
app.use('/users', users);
app.use('/', auth);
app.use(function (req, res, next) {
    if (req.session.user){
      next()
    } else{
      res.redirect('/')
    }
})
app.use('/', telecomics)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
