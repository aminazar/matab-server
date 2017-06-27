'use strict';
const session = require('express-session');
const env = require('../env');

// Initialize session with settings for production


let session_config ={

    secret: 'HosKhedIDA',
    cookie: {},
    resave: true,
    saveUninitialized: true,


}
if (env._env === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    session_config.cookie.secure = true; // serve secure cookies
}


module.exports = session(session_config);

