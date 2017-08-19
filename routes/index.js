const express = require('express');
const router = express.Router();
const path = require('path'); 
const api = require('./api');


/* Diverting unknown routes to Angular router */
router.all("*", function (req, res, next) {

    /* Redirect http to https */
   if (req.originalUrl.indexOf('api') === -1 && req.originalUrl.indexOf('documents') === -1) {
        console.log('[TRACE] Server 404 request: ' + req.originalUrl);
        var p = path.join(__dirname, '../public', 'index.html').replace(/\/routes\//, '/');
        res.status(200).sendFile(p);
    }
    else
        next();
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


let setup = app => {

    app.use('/', router);
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

}


module.exports = {

    setup

};
