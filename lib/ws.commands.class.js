/**
 * Created by Amin on 02/05/2017.
 */
class WSCommand {
  constructor(wsConnections = []){
    this.wsConnections = wsConnections;
  }

  send(data) {
    if(data.msg) {
      if(data.target) {
        if(data.target.constructor.name !== 'Array')
          data.target = [data.target];
        let recipients = new Set();
        data.target.forEach(r=>{
          let userType, user;
          [userType,user] = r.split('/');
          (!user ?
            this.wsConnections.filter(c=>c.path.split('/')[1]===userType)
            :
            this.wsConnections.filter(c=>{
              let pathUser,pathUserType;
              [,pathUserType,pathUser] = c.path.split('/');
              return(pathUser===user && pathUserType === pathUserType)
            })
          ).forEach(c=>recipients.add(c));
        });
        let msg = JSON.stringify(data.msg);
        recipients.forEach(c=>c.sendText(msg));
      }
      else {
        console.log("Socket.send: no 'target' key", data);
      }
    }
    else {
      console.log("Socket.send: no 'msg' key", data);
    }
  }
}

module.exports = WSCommand;