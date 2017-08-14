/**
 * Created by Amin on 15/04/2017.
 */
const sql = require('../sql/index');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const moment = require('moment');
const Patient = require('./patient.model');
const socket = require('../socket/index');
const helper = require('./helpers');

let tableName = 'visits';
let idColumn = 'vid';
let columns = [
  "did",
  "pid",
  "start_time",
  "end_time",
  "paper_id",
  "comments",
  // Below two columns are not in the database table.
  // They are combined to make 'paper_id' (see 'exportData()' and 'importData()')
  "page_number",
  "notebook_number",
  "start_waiting",
  "referee_visit",
  "emgy",
  "nocardio",
];

class Visit extends SqlTable {
  constructor(test = Visit.test) {
    super(tableName, idColumn, test, columns);
  }

  exportData() {
    let exprt = super.exportData();
    if (exprt.page_number && exprt.notebook_number && !exprt.paper_id) {
      exprt.paper_id = (exprt.page_number - 1) + (exprt.notebook_number - 1) * 101;
      delete exprt.page_number;
      delete exprt.notebook_number;
    }
    return exprt;
  }

  importData(data) {
    super.importData(data);
    this.page_number = this.paper_id % 101 + 1;
    this.notebook_number = Math.floor(this.paper_id / 101) + 1;
    delete this.paper_id;
  }

  myVisit(uid) {

    return new Promise((resolve, reject) => {

      let response = {};
      this.sql.visits.select(['did', 'end_time'], ['end_time'])({did: uid, end_time: null})
        .then(res => {
          if (res.length === 0)
            reject(error.notFound);
          else if (res.length > 1)
            reject(`Expected less than 1 visits, found ${res.length}!`);
          else {
            response = res[0];
            let p = new Patient(Visit.test);
            return p.select({pid: response.pid})
              .then(res => {
                if (!res.length)
                  reject(`Patient with pid='${response.pid} not found! Bad visits record vid=${response.vid}.`);
                else {
                  response.patient = res[0];
                  return this.sql.documents.getPatientsDocuments({pid: response.pid})
                    .then(res => {
                      response.documents = res.map(r => {
                        r.description = r.description ? r.description.split('.')[0] : moment(r.saved_at).format('HH:mm ddd DDMMMYY');
                        return r;
                      });
                      resolve(response);
                    })
                }
              })
              .catch(reject);
          }
        })
    });
  }

  getAllVisits(uid) {

  }

  getVisit(vid) {

  }

  startImmediateVisit(uid, did, pid, data) {
    return new Promise((resolve, reject) => {
      let diff = {did: did, pid: pid, page_number: data.page_number, notebook_number: data.notebook_number};
      this.construct(diff);
      this.saveData()
        .then(vid => {
          this.sql.patients.isVip({pid:pid})
            .then(vipResponse=> {
              diff.vid = vid;
              diff.vip = vipResponse[0].vip;
              diff.waiting_start = new Date();
              let sentDiff = {};
              sentDiff[vid] = diff;
              resolve(helper.socketBroadcastCommandGen(helper.NEW_VISIT_CMD, sentDiff));
            });
        })
        .catch(reject);
    });
  }

  startWaiting(uid, did, pid, paper_id) {

  }

  startVisit(uid, vid) {

  }

  changeQueue(uid, vid, did) {

  }

  removeWaiting(uid, vid) {

  }

  refer(uid, vid, did) {

  }

  endVisit(uid, vid) {

  }

  undoVisit(uid, vid) {

  }

  emgyChecked(uid, vid, value) {

  }

  vipChecked(uid, vid, value) {

  }

  nocardioChecked(uid, vid, value) {

  }
}

Visit.test = false;

module.exports = Visit;
