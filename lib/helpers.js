/**
 * Created by Amin on 05/02/2017.
 */
const momentj = require('moment-jalaali');

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

  convertGregoerian: function(d) {
    let m = momentj(d);
    try {
      return {year: m.jYear(), month: m.jMonth() + 1, day: m.jDate(), gd: d};
    }
    catch(err){
      return {year: null, month: null, day: null, gd: null};
    }
  }
};