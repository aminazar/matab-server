/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');

let tableName = 'visits';
let idColumn  = 'vid';

class Visit extends SqlTable{
  constructor(test=Visit.test){
    super(tableName, idColumn, test);
  }

}

Visit.test = false;

module.exports=Visit;