/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const Visit = require('./visit.model');
const moment = require('moment');
const fs = require('fs');

let tableName = 'documents';
let idColumn = 'did';
let columns = [
  'serial',
  'local_addr',
  'mime_type',
  'size',
  'description',
  'saved_at',
  'pid',
  'uid',
  'vid',
];
class Document extends SqlTable {
  constructor(test = Document.test) {
    super(tableName, idColumn, test, columns);
  }

  importData(data) {
    super.importData(data);
    this.saved_at = moment(data.saved_at).format('ddd YYYY-MM-DD HH:mm');
  }

  saveHandscript(userName, fileData) {
    return new Promise((resolve, reject) => {
      let patient;
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
            throw `The patient record for this document was not found.`;
          }
          else {
            patient = res[0];
            sd.vid = res[0].vid;
            sd.pid = res[0].pid;
            sd.uid = res[0].did;
            return super.saveData(sd);
          }
        })
        .then(() => this.sql.visits.update({end_time: new Date()}, patient.vid))
        .then(() => resolve(`Document is added to records of ${patient.firstname} ${patient.surname} by ${patient.display_name} for visit started at ${moment(patient.start_time).format("HH:mm")}`))
        .catch(err => {
          fs.unlink(sd.local_addr, err => {
            if (err) console.log('delete failed:', err)
          });
          reject(err);
        });
    });
  }

  static saveScans(uid, pid, scans, description) {
    console.log(description);
    return Promise.all(
      scans.map(s => {
        let doc = new Document(Document.test);
        let sd = {
          local_addr: s.path,
          mime_type: s.mimetype,
          description: s.originalname,
          size: s.size,
          pid: pid,
          uid: uid,
        };
        return doc.saveData(sd);
      })
    );
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      this.select({did: id})
        .then(res => {
          return new Promise((o, x) => {
            if (res.length !== 1)
              throw(res);
            fs.unlink(res[0].local_addr, err => {
              if (!err)
                o();
              else x(err);
            });
          });
        })
        .then(()=>{return super.delete(id)})
        .then(resolve)
        .catch(reject);
    });
  }
}

Document.test = false;

module.exports = Document;