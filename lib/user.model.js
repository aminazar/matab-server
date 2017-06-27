/**
 * Created by Amin on 01/02/2017.
 */
const sql = require('../sql/index');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');

let tableName = 'users';
let idColumn  = 'uid';
let columns = [
  'secret',
  'name',
  'is_doctor',
  'display_name',
];
class User extends SqlTable{
  constructor(test=User.test){
    super(tableName, idColumn, test, columns);
  }

  load(username,password){
    this.password = password;
    this.username = username.toLowerCase();
    return super.load({name:this.username});
  }

  importData(data) {
    super.importData(data);
    this.is_admin = this.username && helpers.adminCheck(this.username);
  }

  exportData(){
    return new Promise((resolve, reject) => {
      let exprt = super.exportData();
      if(!this.username && exprt.uid)
        reject(error.emptyUsername);
      else if(this.password===undefined) {
        exprt.name = this.username.toLowerCase();
        resolve(exprt);
      }
      else {
        env.bcrypt.genSalt(101, (err, salt) => {
          if (err)
            reject(err);
          else
            env.bcrypt.hash(this.password, salt, null, (err, hash) => {
              if (err)
                reject(err);
              else
                this.secret = hash;

              if(this.username)
                exprt.name = this.username.toLowerCase();
              exprt.secret = hash;
              resolve(exprt);
            });
        });
      }
    });
  }

  checkPassword() {
    return new Promise((resolve, reject) => {
      if(!this.secret)
        reject(error.noPass);
      env.bcrypt.compare(this.password, this.secret, (err, res) => {
        if(err)
          reject(err);
        else if (!res)
          reject(error.badPass);
        else
          resolve();
      });
    });
  }

  loginCheck(username=this.username, password=this.password) {
    return new Promise((resolve,reject) => {
      this.load(username,password)
        .then(()=>this.checkPassword().then(resolve).catch(err=>reject(error.badPass)))
        .catch(err=>reject(error.noUser));
    })
  }

  insert(data){


    this.construct(data);
    this.username = data.username;
    this.password = data.password;
    return this.save();
  }

  update(uid, data){
    this.construct(data,uid);
    if(data.username)
      this.username = data.username;
    if(data.password)
      this.password = data.password;
    return this.save();
  }

  static serialize(user, done) {
    done(null, user);
  };

  static deserialize(user, done) {
    let userInstance = new User();
    userInstance.username = user.username;
    userInstance.password = user.password;
    userInstance.is_doctor = user.is_doctor;

    userInstance.loginCheck()
      .then(() => done(null, user))
      .catch(err => {
        console.log(err.message);
        done(err);
      });
  };

  static passportLocalStrategy(req, username, password, done){
    let user = new User(helpers.isTestReq(req));


    user.loginCheck(username, password)
      .then(()=>done(null,user))
      .catch(err=>done(err,false));
  }

  static afterLogin(username, is_doctor,display_name,uid) {
    return Promise.resolve({
      user:username,
      userType:username==='admin'?'admin':(is_doctor?'doctor':'user'),
      display_name: display_name,
      uid:uid,
    });
  }

  select(is_doctor){
    return new Promise((resolve,reject)=>{
      this.sql.users.select()
        .then( res => {
          resolve(res.filter(r=>r.name!=='admin'&&(is_doctor===undefined || r.is_doctor===is_doctor)).map(r=>{delete r.secret; return r}));
        })
        .catch( err => reject(err));
    });
  }
}
User.test = false;
module.exports = User;