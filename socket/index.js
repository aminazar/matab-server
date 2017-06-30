'use strict';
const sessionConfig = require('../session');
var socketIOSession = require("socket.io.session");


let setup = http => {

    const io = require('socket.io')(http);

    io.set('transports', ['websocket']);

    let socketSession = socketIOSession(sessionConfig.session_config);

    //parse the "/" namespace
    io.use(socketSession.parser);


    var chat = io.on('connection', socket => {

        // console.log(socket.session);

        socket.on('send-message', (message) => {
            console.log('socket message ===> ', message);
        });

    });


    chat.use(socketSession.parser);
}

module.exports = {
    setup
}
