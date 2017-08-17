'use strict';
const sessionConfig = require('../session');
const socketIOSession = require("socket.io.session");
const socketRoutes = require("./socketRoutes");
const helper = require('../lib/helpers');

let io;
let setup = http => {

  this.io = require('socket.io')(http);

  this.io.set('transports', ['websocket']);

  let socketSession = socketIOSession(sessionConfig.session_config);

  //parse the "/" namespace
  this.io.use(socketSession.parser);

  socketRoutes.setup(this.io, socketSession.parser);
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
}
