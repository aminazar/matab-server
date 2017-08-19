/**
 * Created by ali71 on 19/08/2017.
 */
const sql = require('./sql/index');
const env = require('./env');

let changeSQLJson = () => {
  this.sql = sql;
  this.sql.patients.select()()
    .then(res => {
      let promiseList = [];

      for(let row of res){
        let dscp = '';
        let familiar_via = '';
        if(row.contact_details.referredBy !== undefined){
          dscp = (row.contact_details.referredBy !== null) ? row.contact_details.referredBy : '';
          familiar_via = (row.contact_details.referredBy !== null) ? 'doctor' : 'other';
        }
        else{
          dscp = (row.contact_details.familiar.description) ? row.contact_details.familiar.description : '';
          familiar_via = (row.contact_details.familiar.via) ? row.contact_details.familiar.via : 'other';
        }

        delete row.contact_details.referredBy;
        row.contact_details.familiar = {
          via: familiar_via,
          description: dscp
        };

        promiseList.push(this.sql.patients.update({contact_details: row.contact_details}, row.pid));
      }

      return Promise.all(promiseList)
    })
    .then(res => {
      console.log('All records are changed :)');
    })
    .catch(err => {
      console.log(err);
    })
};


changeSQLJson();