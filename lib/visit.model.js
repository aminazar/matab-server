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

  getAllVisits() {
    return this.sql.visits.getAllVisitsToday();
  }

  getVisit(vid) {
    return new Promise((resolve, reject) => {
      let response = {};
      this.sql.visits.getVisit({vid: vid})
        .then(res => {
          if (res.length === 0)
            reject(error.notFound);
          else {
            response = res[0];
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
    });
  }

  startImmediateVisit(displayName, did, pid, data) {
    return this.sql.visits.currentDoctorVisitToday({did: did})
      .then(currentVisits => {
        if (!currentVisits[0])
          return this.startWaiting(displayName, did, pid, data, true);
        else {
          let err = new ReferenceError(`Doctor with did=${did} already has a visit with vid=${currentVisits[0].vid}`);
          err.status = 400;
          return Promise.reject(err);
        }
      })
  }

  startWaiting(displayName, did, pid, data, immediate_visit = false) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.currentPatientVisitsToday({pid: pid})
        .then(currentVisits => {
          if (!currentVisits[0]) {
            let diff = {did: did, pid: pid, page_number: data.page_number, notebook_number: data.notebook_number};

            if (immediate_visit)
              diff.start_time = new Date();

            return this.saveData(diff)
              .then(vid => {
                this.sql.patients.select(['pid'])({pid: pid})
                  .then(patientResponse => {
                    diff.vid = vid;
                    console.log(patientResponse)
                    diff.vip = patientResponse[0].contact_details ? patientResponse[0].contact_details.vip ? true : false : false;
                    for (let key in patientResponse[0])
                      diff[key] = patientResponse[0][key];
                    diff.waiting_start = new Date();
                    resolve(helper.socketBroadcastCommandGen(helper.NEW_VISIT_CMD, diff));
                    console.log(`${displayName} sent ${diff.firstname} ${diff.surname} to queue of doctor with did=${did}`);
                  });
              })
          }
          else {
            let err = new ReferenceError(`Patient with pid=${pid} already has a visit with vid=${currentVisits[0].vid}`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject);
    });
  }

  startVisit(displayName, vid) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.currentDoctorVisitTodayByWaiting({vid: vid})
        .then(currentVisits => {
          if (!currentVisits[0]) {
            let diff = {vid: vid, start_time: new Date()};

            return this.saveData(diff, vid)
              .then(() => {
                resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
                console.log(`${displayName} started queued visit with vid=${vid}`);
              })
          }
          else {
            let err = new ReferenceError(`Doctor with did=${currentVisits[0].did} already has a visit with vid=${currentVisits[0].vid} started at ${currentVisits[0].start_time}`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject);
    });
  }

  changeQueue(displayName, vid, did) {
    return new Promise((resolve, reject) => {
      let diff = {vid: vid, did: did};

      return this.saveData(diff, vid)
        .then(() => {
          resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
          console.log(`${displayName} changed queue for queued visit with vid=${vid} to doctor with did=${did}`);
        })
        .catch(reject);
    });
  }

  removeWaiting(displayName, vid) {
    return new Promise((resolve, reject) => {
      let diff = {vid: vid};

      return this.delete(vid)
        .then(() => {
          resolve(helper.socketBroadcastCommandGen(helper.DELETE_VISIT_CMD, diff));
          console.log(`${displayName} deleted queued visit with vid=${vid}`);
        })
        .catch(reject);
    });
  }

  refer(uid, displayName, vid, did) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.checkReferralConditions({uid: uid, vid: vid})
        .then(currentVisits => {
          if (currentVisits[0]) {
            let endVisitDiff = {end_time: new Date()};
            return this.saveData(endVisitDiff, vid)
              .then(() => {
                let diff = {
                  did: did,
                  referee_visit: vid,
                  pid: currentVisits[0].pid,
                  paper_id: currentVisits[0].paper_id,
                  start_waiting: currentVisits[0].start_waiting,
                };
                this.cleanData();
                return this.saveData(diff)
                  .then(newVid => {
                    diff.vid = newVid;
                    resolve(helper.socketBroadcastCommandGen(helper.REFER_VISIT_CMD, diff));
                    console.log(`${displayName} referred queued visit with vid=${vid} to did=${did}`);
                  })
              });
          }
          else {
            let err = new ReferenceError(`Problematic referral: uid=${uid} did=${did} vid=${vid}`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject);
    });
  }

  endVisit(uid, displayName, isDoctor, vid) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.select(['vid'], [], ['start_time'])({vid: vid})
        .then(startedVisit => {
          if (startedVisit[0]) {
            if (startedVisit[0].did !== +uid && isDoctor) {
              let err = new Error(`You are not allowed to end visit of other doctors, your uid=${uid}, visit with vid=${vid} is for uid=${startedVisit[0].did}`);
              err.status = 403;
              return Promise.reject(err);
            }
            else {
              let diff = {end_time: new Date()};
              return this.saveData(diff, vid)
                .then(() => {
                  diff.vid = vid;
                  resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
                  console.log(`${displayName} ended visit with vid=${vid}`);
                });
            }
          }
          else {
            let err = new ReferenceError(`Visit with vid=${vid} has not been started yet, so it cannot be dismissed.`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject);
    });
  }

  undoVisit(uid, displayName, isDoctor, vid) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.select(['vid'], [], ['start_time'])({vid: vid})
        .then(startedVisit => {
          if (startedVisit[0]) {
            if (startedVisit[0].did !== +uid && isDoctor) {
              let err = new Error(`You are not allowed to undo visit of other doctors, your uid=${uid}, visit with vid=${vid} is for uid=${startedVisit[0].did}`);
              err.status = 403;
              return Promise.reject(err);
            }
            else {
              let diff = {start_time: null};
              return this.saveData(diff, vid)
                .then(() => {
                  diff.vid = vid;
                  resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
                  console.log(`${displayName} reversed starting visit with vid=${vid}`);
                });
            }
          }
          else {
            let err = new ReferenceError(`Visit with vid=${vid} has not been started yet, so it cannot be undone.`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject);
    });
  }

  emgyChecked(displayName, isDoctor, vid, value) {
    return new Promise((resolve, reject) => {
      if (isDoctor) {
        let err = new Error(`Only admins can mark emergency`);
        err.status = 403;
        return Promise.reject(err);
      }
      else {
        return this.sql.visits.select(['vid'], ['start_time'])({vid: vid})
          .then(queuedVisit => {
            if (queuedVisit[0]) {
              let diff = {emgy: !!+value};
              return this.saveData(diff, vid)
                .then(() => {
                  diff.vid = vid;
                  resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
                  console.log(`${displayName} marked visit with vid=${vid} as emergency`);
                })
                .catch(reject)
            }
            else {
              let err = new ReferenceError(`Visit with vid=${vid} has been started or not found, so it cannot be marked as emergency.`);
              err.status = 400;
              return Promise.reject(err);
            }
          })
      }
    });
  }

  vipChecked(displayName, vid, value) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.select(['vid'])({vid: vid})
        .then(visit => {
          if(visit[0]){
            let p = new Patient(Visit.test);
            let diff = {vip:!!+value}
            return p.saveData(diff,visit[0].pid)
              .then(()=>{
                diff.vid = vid;
                resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
                console.log(`${displayName} marked visit with vid=${vid} as VIP`);
              })
          }
          else {
            let err = new ReferenceError(`Visit with vid=${vid} has not been found, so it cannot be marked as VIP.`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject);
    });
  }

  nocardioChecked(displayName, vid, value) {
    return new Promise((resolve, reject) => {
      return this.sql.visits.select(['vid'], ['start_time'])({vid: vid})
        .then(queuedVisit => {
          if (queuedVisit[0]) {
            let diff = {nocardio: !!+value};
            return this.saveData(diff, vid)
              .then(() => {
                diff.vid = vid;
                resolve(helper.socketBroadcastCommandGen(helper.UPDATE_VISIT_CMD, diff));
                console.log(`${displayName} marked visit with vid=${vid} as no cardio`);
              })
          }
          else {
            let err = new ReferenceError(`Visit with vid=${vid} has been started or not found, so it cannot be marked as emergency.`);
            err.status = 400;
            return Promise.reject(err);
          }
        })
        .catch(reject)
    })
  }
}

Visit.test = false;

module.exports = Visit;
