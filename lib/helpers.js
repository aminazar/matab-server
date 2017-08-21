/**
 * Created by Amin on 05/02/2017.
 */
const momentj = require('moment-jalaali');
const NEW_VISIT_CMD = 'INSERT';
const UPDATE_VISIT_CMD = 'UPDATE';
const DELETE_VISIT_CMD = 'DELETE';
const REFER_VISIT_CMD = 'REFER';
const convertGregorian = function(d) {
  let m = momentj(d);
  try {
    return {year: m.jYear(), month: m.jMonth() + 1, day: m.jDate(), gd: d};
  }
  catch(err){
    return {year: null, month: null, day: null, gd: null};
  }
};

module.exports = {
   isTestReq: function(req){return req.query.test==='tEsT'},
  adminCheck: function(username){return username==='admin'},
  createOrExist: function (tableName, sql) {
    return new Promise((resolve, reject) => {
      sql[tableName].create()
        .then(resolve)
        .catch(err => {
          if (err.message.indexOf(`"${tableName}" already exists`) !== -1)
            resolve();
          else
            reject(err);
        })
    })
  },

  dropOrNotExit: function (tableName, sql) {
    return new Promise((resolve, reject) => {
      sql[tableName].drop()
        .then(resolve)
        .catch(err => {
          if (err.message.indexOf(`"${tableName}" does not exist`) !== -1)
            resolve();
          else
            reject(err);
        })
    })
  },

  convertJalaali: function(d) {
    return momentj(`${d.year<100?'13':''}${d.year}/${d.month<10?'0':''}${d.month}/${d.day<10?'0':''}${d.day}`,'jYYYY/jMM/jDD').format('YYYY-MM-DD');
  },

  convertGregoerian: convertGregorian,
  convertAllGregorianDates: function(obj) {
    let ret = {};
    for(let key in obj) {
      if(key==='dob')
        ret.dob = convertGregorian(obj.dob);
      else
        ret[key] = obj[key];
    }

    if(obj.contact_details) {
      ret.contact_details = {};
      for(let key in obj.contact_details) {
        if (key.indexOf('Date') !== -1) {
          ret.contact_details[key] = convertGregorian(obj.contact_details[key]);
        }
        else {
          ret.contact_details[key] = obj.contact_details[key];
        }
      }
    }
    return ret;
  },
  NEW_VISIT_CMD: NEW_VISIT_CMD,
  UPDATE_VISIT_CMD: UPDATE_VISIT_CMD,
  DELETE_VISIT_CMD: DELETE_VISIT_CMD,
  REFER_VISIT_CMD: REFER_VISIT_CMD,

  socketBroadcastCommandGen(cmd,diff,msg) {
    if(!diff.vid) {
      console.error(`diff with ${cmd} doesn't have vid`,diff);
      throw(`diff doesn't have vid`);
    }
    let sentDiff = {};
    sentDiff[diff.vid] = diff;
    delete sentDiff[diff.vid].vid;
    return {
      socketBroadcast: {
        cmd: cmd,
        diff: sentDiff,
        message: msg,
      }
    }
  }
};