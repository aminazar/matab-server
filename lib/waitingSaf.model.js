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
  'did',
  'pid',
  'firstname',
  'surname',
  'display_name',
  'page_num',
  'note_num',
  'priority',
  'visit_date',
  'waite_start_time',
];

class WaitingSaf extends SqlTable{
  constructor(test=WaitingSaf.test){
    super(tableName, idColumn, test, columns);
  }

  addToSaf(data){
    return this.sql.waiting_q.addNewPatientToWating_q(data);
  }

  getWaitings(){
    return this.sql.waiting_q.select()();
  }
}

WaitingSaf.test = false;

module.exports=WaitingSaf;
