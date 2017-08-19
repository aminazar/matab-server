/**
 * Created by Eabasir on 7/1/2017.
 */


/**
 * socket.broadcast.emit() behaves similar to io.sockets.emit ,
 * but instead of emitting to all connected sockets it will emit to all connected socket except the one it is being called on.
 *
 */

const redis = require('../redis');

let userIO;
let patientIO;
let _io;

let setup = (io, socketSessionParser) => {
  _io = io;

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

  getAllNamespaces()
    .then(res => {
      for(let ns of res){
        _io.of(ns).on('connection', socket => {
          //Code to execute after any clients connected to specific namespace
        });
      }
    })
    .catch(err => console.log('Error: when fetch all namespaces. ', err));
};

let getUserIO = () => {

  return userIO;
};

let getPatientIO = () => {

  return patientIO;
};

let saveNamespace = (namespace) => {
  return new Promise((resolve, reject) => {
    redis.redis_client.saddAsync('namespaces', namespace)
      .then(res => {
        _io.of(namespace).on('connection', socket => {
          //Code to execute after clients connected to specific namespace
        });
        resolve();
      })
      .catch(err => {
        reject('Cannot store namespace on redis');
      });
  });
};

let isNamespaceExist = (namespace) => {
  return new Promise((resolve, reject) => {
    redis.redis_client.sismemberAsync('namespaces', namespace)
      .then(res => {
        if(res)
          resolve(_io.of(namespace));
        else
          reject(null);
      })
      .catch(err => reject(err));
  });
};

let getAllNamespaces = () => {
  return redis.redis_client.smembersAsync('namespaces');
};

let deleteNamespace = (namespace) => {
  return redis.redis_client.sremAsync('namespace', namespace);
};

module.exports = {
  setup,
  getUserIO,
  getPatientIO,
  saveNamespace,
  isNamespaceExist,
  deleteNamespace,
};