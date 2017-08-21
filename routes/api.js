const lib = require('../lib');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const env = require('../env');
const moment = require('moment');
const socket = require('../socket');
const storage = multer.diskStorage({
    destination: env.filePath + '\\' + moment().format('YYMMDD'),
    filename: (req, file, cb) => {
        cb(null, [moment().format('HHmmssSSS'), req.params.username || req.user.username, file.originalname].join('.'));
    }
});
const upload = multer({storage: storage});

function apiResponse(className, functionName, adminOnly = false, reqFuncs = []) {

    let args = Array.prototype.slice.call(arguments, 4);
    let deepFind = function (obj, pathStr) {
        let path = pathStr.split('.');
        let len = path.length;
        for (let i = 0; i < len; i++) {
            if (typeof obj === 'undefined') {
                let err = new Error(`Bad request: request.${pathStr} is not found at '${path[i]}'`);
                err.status = 400;
                throw(err);
            }
            obj = obj[path[i]];
        }
        return obj;
    };
    return (function (req, res) {

        let user = req.user ? req.user.username : req.user;

        req.test = lib.helpers.isTestReq(req);
        if (adminOnly && !lib.helpers.adminCheck(user)) {
            res.status(403)
                .send('Only admin can do this.');
        }
        else if(functionName!=='saveHandscript' && !user) {
            res.status(403).send('You need to login to do this.')
        }
        else {
            let dynamicArgs = [];

            for (let i in reqFuncs)
                dynamicArgs.push((typeof reqFuncs[i] === 'function') ? reqFuncs[i](req) : deepFind(req, reqFuncs[i]));


            let allArgs = dynamicArgs.concat(args);
            lib[className].test = req.test;
            let isStaticFunction = typeof lib[className][functionName] === 'function';
            let model = isStaticFunction ? lib[className] : new lib[className](req.test);
            model[functionName].apply(isStaticFunction ? null : model, allArgs)
                .then(data => {
                    if(data.socketBroadcast) {
                      socket.rawBroadcast(data.socketBroadcast.cmd, data.socketBroadcast.diff)
                        .then(()=> {
                          res.status(200).end();
                        });
                    }
                    else {
                      res.status(200)
                        .json(data);
                    }
                })
                .catch(err => {
                    console.log(`${className}/${functionName}: `, env.isProd ? err.message : err);
                    res.status(err.status || 500)
                        .send(err.message || err);
                });
        }
    });
}

router.get('/', function (req, res) {
    res.send('respond with a resource');
});

// todo: apis are not secure... req.isAuthenticated must be added to following router actions
//Login API
router.post('/login', passport.authenticate('local', {}), apiResponse('User', 'afterLogin', false, ['user.username', 'user.is_doctor', 'user.display_name', 'user.uid']));
router.post('/loginCheck', apiResponse('User', 'loginCheck', false, ['body.username', 'body.password']));
router.get('/logout', (req, res) => {
    req.logout();
    res.sendStatus(200)
});
router.get('/validUser', apiResponse('User', 'afterLogin', false, ['user.username', 'user.is_doctor', 'user.display_name', 'user.uid']));
//User API
router.put('/user', apiResponse('User', 'insert', true, ['body']));
router.get('/user', apiResponse('User', 'select', true));
router.post('/user/:uid', apiResponse('User', 'update', true, ['params.uid', 'body']));
router.delete('/user/:uid', apiResponse('User', 'delete', true, ['params.uid']));
router.get('/doctors', apiResponse('User', 'select', false, [() => true]));
//Patient API
router.put('/patient', apiResponse('Patient', 'saveData', false, ['body']));
router.get('/patient', apiResponse('Patient', 'selectId', false));
router.get('/patient-full-data/:pid', apiResponse('Patient', 'select', false, ['params']));
router.post('/patient/:pid', apiResponse('Patient', 'saveData', false, ['body', 'params.pid']));
router.delete('/patient/:pid', apiResponse('Patient', 'delete', false, ['params.uid']));
//Visit API
router.get('/visits', apiResponse('Visit', 'getAllVisits', false, []));
router.get('/visit/:vid', apiResponse('Visit', 'getVisit', false, ['params.vid']));
router.put('/immediate-visit/:did/:pid', apiResponse('Visit', 'startImmediateVisit', false, ['user.display_name','params.did','params.pid','body']));
router.put('/waiting/:did/:pid', apiResponse('Visit','startWaiting', false, ['user.display_name','params.did','params.pid','body']));
router.put('/visit/:vid', apiResponse('Visit','startVisit', false, ['user.display_name','params.vid']));
router.post('/queue/:vid/:did', apiResponse('Visit','changeQueue', false, ['user.display_name','params.vid','params.did']));
router.delete('/waiting/:vid', apiResponse('Visit','removeWaiting', false, ['user.display_name','params.vid']));
router.post('/refer/:vid/:did', apiResponse('Visit','refer', false, ['user.uid','user.display_name','params.vid','params.did']));
router.post('/end-visit/:vid', apiResponse('Visit','endVisit', false, ['user.uid','user.display_name','user.is_doctor','params.vid']));
router.post('/undo-visit/:vid', apiResponse('Visit','undoVisit', false, ['user.uid','user.display_name','user.is_doctor','params.vid']));
router.post('/emgy-checked/:vid/:value',apiResponse('Visit','emgyChecked', false, ['user.display_name','user.is_doctor','params.vid','params.value']));
router.post('/vip-checked/:vid/:value',apiResponse('Visit','vipChecked', false, ['user.display_name','params.vid','params.value']));
router.post('/nocardio-checked/:vid/:value',apiResponse('Visit','nocardioChecked', false, ['user.display_name','params.vid','params.value']));
//Document API
router.get('/patient-documents/:pid', apiResponse('Document', 'select', false, ['params']));
router.get('/visit-documents/:vid', apiResponse('Document', 'select', false, ['params']));
router.post('/handwriting/:username', upload.single('userfile'), apiResponse('Document', 'saveHandscript', false, ['params.username', 'file', 'user.is_doctor']));
router.post('/scans/:pid', upload.array('file'), apiResponse('Document', 'saveScans', false, ['user.uid', 'params.pid', 'files', 'body.description']));
router.delete('/document/:did', apiResponse('Document', 'delete', false, ['params.did']));


module.exports = router;
