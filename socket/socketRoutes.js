/**
 * Created by Eabasir on 7/1/2017.
 */


/**
 * socket.broadcast.emit() behaves similar to io.sockets.emit ,
 * but instead of emitting to all connected sockets it will emit to all connected socket except the one it is being called on.
 *
 */

let userIO;
let patientIO;

let setup = (io, socketSessionParser) => {


    userIO = io.of('/user');
    let userConnection = userIO.on('connection', socket => {

        console.warn('===> user-socket-connected ', socket.session.passport.user.username);

        socket.on('req', (message) => {
            console.log('user socket message ===> ', message);
        });

    });
    userConnection.use(socketSessionParser);

    patientIO = io.of('/patient');
    let patientConnection = patientIO.on('connection', socket => {


        console.warn('===> patient-socket-connected ', socket.session.passport.user.username);

        socket.on('req', (message) => {
            console.log('patient socket message ===> ', message);

            socket.broadcast.emit('ans', message)
        });

    });
    patientConnection.use(socketSessionParser);


};

let getUserIO = () =>{

    return userIO;
};

let getPatientIO = () =>{

    return patientIO;
};


module.exports = {
    setup,
    getUserIO,
    getPatientIO
};