let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let index = require('./routes/index');
let api   = require('./routes/api');
let passport = require('passport');
let PassLocal= require('passport-local');
let session  = require('express-session');
let lib      = require('./lib');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session:
let sess = {
  secret: 'HosKhedIDA',
  cookie: {},
  resave: true,
  saveUninitialized: true,

};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));
//Passport:
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(lib.User.serialize);
passport.deserializeUser(lib.User.deserialize);
passport.use(new PassLocal(
  {
    passReqToCallback: true,
  },
  lib.User.passportLocalStrategy
));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  let jsonError = req.app.get('env') === 'development' ? {
    Message: err.message,
    Stack: err.stack,
  } : {Message: err.message};

  res.status(err.status || 500).json(jsonError);
  console.log(err);
});

module.exports = app;
