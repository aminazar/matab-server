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
  'contact_details',
];

class Patient extends SqlTable{
  constructor(test=Patient.test){
    super(tableName, idColumn, test, columns);
  }
}

Patient.test = false;

module.exports=Patient;