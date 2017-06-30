'use strict';
const env = require('../env');
let session = require('express-session');
let RedisStore = require('connect-redis')(session);
const redis = require('redis').createClient();

let session_config = {
    secret: 'HosKhedIDA',
    cookie: {},
    resave: true,
    saveUninitialized: true,
};

var sessionStore = new RedisStore({
    "client": redis,
    "host": "127.0.0.1",
    "port": 6379
});


let setup = (app) => {


    session_config.store = sessionStore;

    // Initialize session with settings for production
    if (env._env === 'production') {
        app.set('trust proxy', 1); // trust first proxy
        session_config.cookie.secure = true; // serve secure cookies
    }

    app.use(session(session_config));

};

module.exports = {
    setup,
    session_config
};