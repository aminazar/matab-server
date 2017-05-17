/**
 * Created by Sareh on 16/05/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
let tableName = 'waiting_q';
let idColumn  = 'wsid';
let columns = [
  'wsid',
  'uid',
  'pid',
  'page_num',
  'note_num',
  'priority',
  'visit_date',
];

class WaitingSaf extends SqlTable{
  constructor(test=WaitingSaf.test){
    super(tableName, idColumn, test, columns);
  }

  // construct(data,id) {
  //   data.dob = helpers.convertJalaali(data.dob);
  //   for(let key in data.contact_details)
  //     if(key.indexOf('Date')!==-1)
  //       data.contact_details[key] = helpers.convertJalaali(data.contact_details[key]);
  //
  //   super.construct(data,id);
  // }
  //
  // importData(data) {
  //   super.importData(data);
  //   this.dob = helpers.convertGregoerian(this.dob);
  //   for(let key in this.contact_details)
  //     if(key.indexOf('Date')!==-1) {
  //       this.contact_details[key] = helpers.convertGregoerian(this.contact_details[key]);
  //     }
  // }
  addToSaf(data){
    return this.sql.waiting_q.addNewPatientToWating_q(data);
  }

}

WaitingSaf.test = false;

module.exports=WaitingSaf;
