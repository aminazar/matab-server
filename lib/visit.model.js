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
]
class Visit extends SqlTable {
  constructor(test = Visit.test) {
    super(tableName, idColumn, test, columns);
  }

  exportData() {
    let exprt = super.exportData();
    exprt.paper_id = (exprt.page_number - 1) + (exprt.notebook_number - 1) * 101;
    delete exprt.page_number;
    delete exprt.notebook_number;
    return exprt;
  }

  importData(data) {
    super.importData(data);
    this.page_number = this.paper_id % 101 + 1;
    this.notebook_number = Math.floor(this.paper_id / 101) + 1;
    delete this.paper_id;
  }

    //todo: this api must be deleted as waiting and visits are integrated
    selectActiveVisits() {
        return this.sql.visits.getActiveVisits();
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

    todayVisits(uid) {
        return new Promise((resolve, reject) => {
            let response = {};
            this.sql.visits.myTodayVisits(['did', 'end_time'], ['end_time'])({did: uid, end_time: null})
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

    endVisit(pid, uid) {
        return this.sql.visits.endVisit({pid: pid, uid: uid}).then(this.acceptNextVisit);
    }

    referVisit(data) {

        console.log(data);
        return this.sql.visits.referVisit(data).then(this.acceptNextVisit);
    }


    acceptNextVisit(data) {

        return sql.visits.acceptNextVisit({did: data[0].did});

    }
}

Visit.test = false;

module.exports = Visit;
