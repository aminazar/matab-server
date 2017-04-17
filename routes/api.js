const lib = require('../lib');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const env = require('../env');
const moment = require('moment');
const storage = multer.diskStorage({
  destination: env.filePath + '/' + moment().format('YYMMDD'),
  filename: (req,file,cb) => {
    cb(null,[req.params.username,file.originalname].join('|'));
  }
});
const upload = multer({storage: storage});

function apiResponse(className, functionName, adminOnly=false, reqFuncs=[]){
  let args = Array.prototype.slice.call(arguments, 4);
  let deepFind = function(obj, pathStr){
    let path = pathStr.split('.');
    let len=path.length;
    for (let i=0; i<len; i++){
      if(typeof obj === 'undefined') {
        let err = new Error(`Bad request: request.${pathStr} is not found at '${path[i]}'`);
        err.status = 400;
        throw(err);
      }
      obj = obj[path[i]];
    }
    return obj;
  };
  return(function(req, res) {
    let user = req.user ? req.user.username : req.user;
    req.test = lib.helpers.isTestReq(req);
    if(adminOnly && !lib.helpers.adminCheck(user)) {
      res.status(403)
        .send('Only admin can do this.');
    }
    else {
      let dynamicArgs = [];
      for(let i in reqFuncs)
        dynamicArgs.push((typeof reqFuncs[i]==='function') ? reqFuncs[i](req) : deepFind(req,reqFuncs[i]));

      let allArgs = dynamicArgs.concat(args);
      lib[className].test = req.test;
      let isStaticFunction = typeof lib[className][functionName] === 'function';
      let model = isStaticFunction ? lib[className] : new lib[className](req.test);
      model[functionName].apply(isStaticFunction?null:model, allArgs)
        .then(data=> {
          res.status(200)
            .json(data);
        })
        .catch(err=> {
          console.log(`${className}/${functionName}: `, env.isProd ? err.message : err);
          res.status(err.status||500)
            .send(err.message || err);
        });
    }
  });
}

router.get('/', function(req, res) {
  res.send('respond with a resource');
});
//Login API
router.post('/login', passport.authenticate('local', {}), apiResponse('User', 'afterLogin', false, [ 'user.username']));
router.post('/loginCheck', apiResponse('User', 'loginCheck', false, ['body.username', 'body.password']));
router.get('/logout', (req,res)=>{req.logout();res.sendStatus(200)});
router.get('/validUser',apiResponse('User', 'afterLogin', false, ['user.username']));
//User API
router.put('/user', apiResponse('User', 'insert', true, ['body']));
router.get('/user', apiResponse('User', 'select', true));
router.post('/user/:uid', apiResponse('User', 'update', true, ['params.uid','body']));
router.delete('/user/:uid', apiResponse('User', 'delete', true, ['params.uid']));
//Patient API
router.put('/patient', apiResponse('Patient', 'saveData', false, ['body']));
router.get('/patient', apiResponse('Patient', 'select', false));
router.post('/patient/:pid', apiResponse('Patient', 'saveData', false, ['body', 'params.pid']));
router.delete('/patient/:pid', apiResponse('Patient', 'delete', false, ['params.uid']));
//Visit API
router.put('/visit', apiResponse('Visit', 'saveData', false, ['body']));
router.get('/visit/:did', apiResponse('Visit', 'select', false, ['params']));
router.post('/visit/:vid', apiResponse('Visit', 'saveData', false, ['body','params.vid']));
router.delete('/visit/:vid', apiResponse('Visit', 'delete', false, ['params.vid']));
//Document API
router.put('/document', upload.single('file'), apiResponse('Document', 'saveData', false, ['body']));
router.get('/patient-documents/:pid', apiResponse('Document', 'select', false, ['params']));
router.get('/visit-documents/:vid', apiResponse('Document', 'select', false, ['params']));
router.post('/handwriting/:username', upload.single('userfile'), apiResponse('Document', 'saveHandscript', false, ['params.username','file']));
router.delete('/document/:did', apiResponse('Document', 'delete', false, ['params.vid']));

module.exports = router;