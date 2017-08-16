'use strict';
const sessionConfig = require('../session');
var socketIOSession = require("socket.io.session");
const socketRoutes = require("./socketRoutes");
const passportSocketIO = require('passport.socketio');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const redis = require('../redis');

const NEW_MESSAGE = 'NEW_MESSAGE';
const NEW_VISIT_CMD = 'newVisit';
const DISMISS_CMD = 'dismiss';
const REFER_VISIT_CMD = 'referVisit';
let io;
let setup = http => {

  io = require('socket.io')(http);
  io.use(passportSocketIO.authorize({
    key: 'connect.sid',
    secret: 'HosKhedIDA',
    store: sessionConfig.session_config.store,
    passport: passport,
    cookieParser: cookieParser,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  }));
  io.adapter(redis.redis_socket({host: 'localhost', port: 6379}));
  io.set('transports', ['websocket']);

  let socketSession = socketIOSession(sessionConfig.session_config);

  //parse the "/" namespace
  io.use(socketSession.parser);

  socketRoutes.setup(io, socketSession.parser);
};

function onAuthorizeSuccess(data, accept) {
  console.log('Successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  if (error)
    accept(new Error(message));

  console.log('Failed connection  to socket.io', message);
  accept(null, false);
}


let sendNewVisitMessageToAllClients = (data) => {
  return promise(NEW_VISIT_CMD, data[0], socketRoutes.getPatientIO())
};

let sendDismissMessageToAllClients = (data) => {
  return promise(DISMISS_CMD, data, socketRoutes.getPatientIO());
};

let sendReferMessageToAllClients = (data) => {
  console.log('=======>', data);

  return promise(REFER_VISIT_CMD, data, socketRoutes.getPatientIO());
};

let sendMessage = (data, namespace) => {
  return new Promise((resolve, reject) => {
    socketRoutes.isNamespaceExist(namespace)
      .then(ns => {
        if(ns)
          promise(NEW_MESSAGE, data, ns)
            .then(res => resolve(res))
            .catch(err => {
              console.log('Error when calling promise function: ', err);
              reject(err);
            });
        else
          reject('No namespace found');
      });
  });
};

let promise = (cmd, data, io) => {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let message = {
        cmd: cmd,
        msg: data
      };

      io.emit('ans', message);
      resolve(data);

    }, 0)
  })

};

module.exports = {
  setup,
  sendNewVisitMessageToAllClients,
  sendDismissMessageToAllClients,
  sendReferMessageToAllClients,
  sendMessage,
  storeNamespace: socketRoutes.saveNamespace,
  getNamespace: socketRoutes.isNamespaceExist,
  deleteNamespace: socketRoutes.deleteNamespace,
};
