'use strict';
const sessionConfig = require('../session');
var socketIOSession = require("socket.io.session");
const  socketRoutes = require("./socketRoutes");


let setup = http => {

    const io = require('socket.io')(http);

    io.set('transports', ['websocket']);

    let socketSession = socketIOSession(sessionConfig.session_config);

    //parse the "/" namespace
    io.use(socketSession.parser);

    socketRoutes.setup(io , socketSession.parser)

}

module.exports = {
    setup
}
