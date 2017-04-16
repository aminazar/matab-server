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
  'description',
  'pid',
  'uid',
  'vid',
];
class Document extends SqlTable{
  constructor(test=Patient.test){
    super(tableName, idColumn, test, columns);
  }

  saveHandscript(userName, fileData) {
    let sd ={
      local_addr: fileData.path,
      mime_type: fileData.mimetype,
      size: fileData.size,
    };
    let pageNumber,notebookNumber;
    [pageNumber,notebookNumber] =
    fileData.local_addr = fileData.originalname.match(/\d+/g);
    let v = new Visit(Document.test);
    sql.visit.getVisitForPage({paper_id: (pageNumber-1) + (notebookNumber-1) * 101})
    super.saveData(sd);
  }
}

Document.test = false;

module.exports=Document;