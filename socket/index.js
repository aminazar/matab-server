'use strict';
const sessionConfig = require('../session');

const socketIOSession = require("socket.io.session");
const socketRoutes = require("./socketRoutes");
const passportSocketIO = require('passport.socketio');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const redis = require('../redis');
const helper = require('../lib/helpers');

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

let sendMessage = (data, namespace) => {
  return new Promise((resolve, reject) => {
    socketRoutes.isNamespaceExist(namespace)
      .then(ns => {
        if(ns)
          promise(helper.NEW_MESSAGE, data, ns)
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

let sendNewVisitMessageToAllClients = (data) => {
  return promise(helper.NEW_VISIT_CMD, data[0], socketRoutes.getPatientIO())
};

let sendUpdateVisitMessageToAllClients = (data) => {
  return promise(helper.UPDATE_VISIT_CMD, data[0], socketRoutes.getPatientIO())
};

let sendDeleteVisitMessageToAllClients = (data) => {
  return promise(helper.DELETE_VISIT_CMD, data[0], socketRoutes.getPatientIO())
};

let rawBroadcast = (cmd, data) => {
  return promise(cmd, data, socketRoutes.getPatientIO())
};

let promise = (cmd, data, io) => {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let message = {
        cmd: cmd,
        msg: data
      };
      console.warn(message);
      io.emit('ans', message);
      resolve(data);
    }, 0)
  })

};

module.exports = {
  setup,
  sendNewVisitMessageToAllClients,
  sendUpdateVisitMessageToAllClients,
  sendDeleteVisitMessageToAllClients,
  rawBroadcast,
  sendMessage,
  storeNamespace: socketRoutes.saveNamespace,
  getNamespace: socketRoutes.isNamespaceExist,
  deleteNamespace: socketRoutes.deleteNamespace,
};
