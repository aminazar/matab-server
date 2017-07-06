/**
 * Created by Eabasir on 7/1/2017.
 */


/**
 * socket.broadcast.emit() behaves similar to io.sockets.emit ,
 * but instead of emitting to all connected sockets it will emit to all connected socket except the one it is being called on.
 *
 */


let setup = (io, socketSessionParser) => {

    let userIO = io.of('/user').on('connection', socket => {

        console.log('===> user-socket-connected');

        socket.on('req', (message) => {
            console.log('user socket message ===> ', message);
        });

    });
    userIO.use(socketSessionParser);

    let patientIO = io.of('/patient').on('connection', socket => {


        console.log('===> patient-socket-connected');

        socket.on('req', (message) => {
            console.log('patient socket message ===> ', message);

           socket.broadcast.emit('ans', message)
        });

    });
    patientIO.use(socketSessionParser);


}

module.exports = {

    setup
}