/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
let tableName = 'patients';
let idColumn  = 'pid';
let columns = [
  'firstname',
  'surname',
  'id_number',
  'dob',
  'contact_details',
];

class Patient extends SqlTable{
  constructor(test=Patient.test){
    super(tableName, idColumn, test, columns);
  }

  construct(data,id) {
    data.dob = helpers.convertJalaali(data.dob);
    for(let key in data.contact_details)
      if(key.indexOf('Date')!==-1)
        data.contact_details[key] = helpers.convertJalaali(data.contact_details[key]);

    super.construct(data,id);
  }

  importData(data) {
    super.importData(data);
    this.dob = helpers.convertGregoerian(this.dob);
    for(let key in this.contact_details)
      if(key.indexOf('Date')!==-1) {
        this.contact_details[key] = helpers.convertGregoerian(this.contact_details[key]);
      }
  }

  selectId(){
    return this.sql.patients.selectId();
  }
}

Patient.test = false;

module.exports=Patient;