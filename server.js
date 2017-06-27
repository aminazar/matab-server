let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let index = require('./routes/index');
let api = require('./routes/api');
let passport = require('passport');
let PassLocal = require('passport-local');
let session = require('./session');
let lib = require('./lib');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');
const env = require('./env');
const config = require('./config.json')[env._env];


let app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);

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
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    let jsonError = req.app.get('env') === 'development' ? {
        Message: err.message,
        Stack: err.stack,
    } : {Message: err.message};

    res.status(err.status || 500).json(jsonError);
    console.log(err);
});

// Create an IO Server instance
const http = require('http').Server(app);
const io = require('socket.io')(http);
io.set('transports', ['websocket']);
let pubClient = redis(config.redis.port, config.redis.host, {
    auth_pass: config.redis.password
});
let subClient = redis(config.redis.port, config.redis.host, {
    return_buffers: true,
    auth_pass: config.redis.password
});
io.adapter(adapter({
    pubClient,
    subClient
}));
io.use((socket, next) => {
    session(socket.request, {}, next);
});
require('./socket')(io, app);


/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

http.listen(app.get('port'), () => {
    console.log('server Running on Port: ', app.get('port'));
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


