/**
 * Created by Amin on 26/08/2017.
 */
const socket = require('../socket')
class Chat {
  static sendMessage(uid, namespace, data) {
   return socket.sendMessage(JSON.stringify({msgType:"chat", data: data, sender: uid}), namespace)
  }
};
module.exports = Chat;