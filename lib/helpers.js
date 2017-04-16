/**
 * Created by Amin on 05/02/2017.
 */
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
  }
};