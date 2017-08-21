let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

const session = require('./session');
const socket = require('./socket');
const passport = require('./passport');
const route = require('./routes');
const backup = require('./backup');

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

session.setup(app);
passport.setup(app);
route.setup(app);
backup.setup('../public/documents', '../public/backups/documents', '16L57ApNbTAAAAAAAAAACHXYvul6TGBlwvmg3aSMZODTPJgVquyipEOuIrXpyjlN');


// Create an IO Server instance
const http = require('http').Server(app);
socket.setup(http);

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


