/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql/index');
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
  'vip',
];

class Patient extends SqlTable{
  constructor(test=Patient.test){
    super(tableName, idColumn, test, columns);
  }

  construct(data,id) {
    if(data.dob)
      data.dob = helpers.convertJalaali(data.dob);
    for(let key in data.contact_details)
      if(key.indexOf('Date')!==-1)
        data.contact_details[key] = helpers.convertJalaali(data.contact_details[key]);

    super.construct(data,id);
  }

  importData(data) {
    data = helpers.convertAllGregorianDates(data);
    super.importData(data);
  }

  selectId(){
    return this.sql.patients.selectId();
  }
}

Patient.test = false;

module.exports=Patient;