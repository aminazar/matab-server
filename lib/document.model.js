/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql/index');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const moment = require('moment');
const fs = require('fs');
const exec = require('child-process-promise').exec;
const socket = require('../socket');
const path = require('path');

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
let pdftkPathCommand = 'pdftk'; //Default command is based on linux distributions
class Document extends SqlTable {
  constructor(test = Document.test) {
    pdftkPathCommand = (process.platform === 'win32') ? '"C:/Program Files (x86)/PDFtk Server/bin/pdftk.exe"' : 'pdftk';
    super(tableName, idColumn, test, columns);
  }

  importData(data) {
    super.importData(data);
    this.saved_at = moment(data.saved_at).format('ddd YYYY-MM-DD HH:mm');
  }

  saveHandscript(userName, fileData, late = false) {
    return new Promise((resolve, reject) => {
      let patient;
      let sd = {
        local_addr: fileData.path,
        mime_type: fileData.mimetype,
        size: fileData.size,
      };
      let pageNumber, notebookNumber;
      [pageNumber, notebookNumber] = fileData.originalname.match(/\d+/g);
      let getVisitsForPageSQL = late ? "getVisitForPageLate" : "getVisitForPage";
      this.sql.visits[getVisitsForPageSQL]({name: userName, paper_id: (pageNumber - 1) + (notebookNumber - 1) * 101})
        .then(res => {
          if (res.length !== 1) {
            console.log('VISITS LENGTH ERROR', res);
            let err = new ReferenceError(res.length ? `ERROR: Multiple patient records!` : `ERROR: The patient record not found!`);
            err.status = 400;
            reject(err);
          }
          else {
            patient = res[0];
            sd.vid = res[0].vid;
            sd.pid = res[0].pid;
            sd.uid = res[0].did;
            return this.sql.documents.getPreviousDocument({
              vid: sd.vid,
              pid: sd.pid,
              paper_id: (pageNumber - 1) + (notebookNumber - 1) * 101
            });
          }
        })
        .then(res => {
          if (res.length > 0) {
            console.log('diff', moment().diff(res[0].saved_at, 'seconds'))
            if (moment().diff(res[0].saved_at, 'seconds') > 10) {
              let dirPath = path.dirname(sd.local_addr);
              return exec(pdftkPathCommand + ' "' + res[0].local_addr.replace(/\\/g, "/") + '" background "' + sd.local_addr.replace(/\\/g, "/") + '" output "' + dirPath + '/combined.pdf"');
            }
            else {
              return Promise.reject('You cannot overwrite the same paper within 10 seconds.')
            }
          }
          else
            return Promise.resolve('NO-PREVIOUS');
        })
        .then(res => {
          if (res !== 'NO-PREVIOUS') {
            let dirPath = path.dirname(sd.local_addr);
            fs.unlink(sd.local_addr.replace(/\\/g, "/"));
            fs.rename(dirPath + '/combined.pdf', sd.local_addr.replace(/\\/g, "/"));
          }
          return super.saveData(sd);
        })
        .then(() => {
          let namespace = 'doctor/' + userName;
          return socket.sendMessage(JSON.stringify({
            text: "Your handwritten comments were added.",
            msgType: "Comments saved",
            sd: sd
          }), namespace);
        })
        .then(() => resolve(`Document is added to records of ${patient.firstname} ${patient.surname} by ${patient.display_name} for visit started at ${moment(patient.start_time).format("HH:mm")}`))
        .catch(err => {
          fs.unlink(sd.local_addr, err => {
            if (err) console.log('delete failed:', err)
          });
          reject(err);
        });
    });
  }

  static saveScans(uid, pid, scans) {
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
        .then(() => {
          return super.delete(id)
        })
        .then(resolve)
        .catch(reject);
    });
  }
}

Document.test = false;

module.exports = Document;
