/**
 * Created by Sareh on 16/05/2017.
 */
const sql = require('../sql/index');
const env = require('../env');
const helpers = require('./helpers');
const SqlTable = require('./sqlTable.model');
const error = require('./errors.list');
const socket = require('../socket/index');
let tableName = 'waiting';
let idColumn = 'wsid';
let columns = [
    'wsid',
    'did',
    'pid',
    "paper_id",
    'page_num',
    'note_num',
    'priority',
    'wait_start_time',
    'isVisit'
];

class Waiting extends SqlTable {
    constructor(test = Waiting.test) {
        super(tableName, idColumn, test, columns);
    }

    /**
     * this is used for insert record in both waiting & visits tables.
     *
     * @param
     * @returns {*}
     */
    addToWaiting(data) {

        data.paper_id = (data.page_num - 1) + (data.note_num - 1) * 101;
        delete data.page_num;
        delete data.note_num;

        console.log(data);

        return this.sql.waiting.addToWaiting(data)
            .then(this.getLastWaiting)
            .then(socket.sendNewVisitMessageToAllClients);
    }

    getWaitingList() {
        return this.sql.waiting.getWaitingList();
    }

    getLastWaiting() {
        return sql.waiting.getLastWaiting();


    }


}

Waiting.test = false;

module.exports = Waiting;
