'use strict';
const sessionConfig = require('../session');
var socketIOSession = require("socket.io.session");
const  socketRoutes = require("./socketRoutes");

const NEW_VISIT_CMD = 'newVisit';
const DISMISS_CMD = 'dismiss';
const REFER_VISIT_CMD = 'referVisit';
let io;
let setup = http => {

    this.io = require('socket.io')(http);

    this.io.set('transports', ['websocket']);

    let socketSession = socketIOSession(sessionConfig.session_config);

    //parse the "/" namespace
    this.io.use(socketSession.parser);

     socketRoutes.setup(this.io, socketSession.parser);

};



let sendNewVisitMessageToAllClients = (data) =>{
    return promise(NEW_VISIT_CMD, data[0] , socketRoutes.getPatientIO())
};

let sendDismissMessageToAllClients = (data) =>{
    return promise(DISMISS_CMD , data , socketRoutes.getPatientIO());
};

let sendReferMessageToAllClients = (data) =>{
    console.log('=======>' , data);

    return promise(REFER_VISIT_CMD, data , socketRoutes.getPatientIO());
};


let promise =  (cmd , data , io) => {

    return new Promise((resolve , reject) => {
        setTimeout(() => {
            let message = {
                cmd: cmd,
                msg:data
            };

            io.emit('ans', message);
            resolve(data);

        } ,0)
    })

};

module.exports = {
    setup,
    sendNewVisitMessageToAllClients,
    sendDismissMessageToAllClients,
    sendReferMessageToAllClients
}
