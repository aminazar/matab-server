/**
 * Created by Amin on 26/08/2017.
 */
const socket = require('../socket');
const helper = require('../lib/helpers');
class Chat {
  static sendMessage(uid, userType, username, data) {
    let namespace = `${userType}/${username}`;
    let msg = JSON.stringify({msgType: "chat", data: data, sender: uid});
    if (username === 'all') {
      return socket.rawBroadcast(helper.NEW_MESSAGE, msg);
    } else {
      return socket.sendMessage(msg, namespace);
    }
  }
}
;
module.exports = Chat;