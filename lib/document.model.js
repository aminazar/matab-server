/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const Visit = require('./visit.model');

let tableName = 'documents';
let idColumn  = 'did';
let columns = [
  'serial',
  'local_addr',
  'mime_type',
  'size',
  'description',
  'pid',
  'uid',
  'vid',
];
class Document extends SqlTable{
  constructor(test=Document.test){
    super(tableName, idColumn, test, columns);
  }

  saveHandscript(userName, fileData) {
    return new Promise((resolve, reject) => {
      let sd = {
        local_addr: fileData.path,
        mime_type: fileData.mimetype,
        size: fileData.size,
      };
      let pageNumber, notebookNumber;
      [pageNumber, notebookNumber] = fileData.originalname.match(/\d+/g);
      this.sql.visits.getVisitForPage({name: userName, paper_id: (pageNumber - 1) + (notebookNumber - 1) * 101})
        .then(res => {
          if (res.length !== 1) {
            console.log('VISITS LENGTH ERROR', res);
            throw `Length of visits = ${res.length}, expected 1.`;
          }
          else {
            sd.vid = res[0].vid;
            sd.pid = res[0].pid;
            sd.uid = res[0].did;
            return super.saveData(sd);
          }
        })
        .then(resolve)
        .catch(reject);
    });
  }
}

Document.test = false;

module.exports=Document;