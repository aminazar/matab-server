/**
 * Created by ali71 on 20/08/2017.
 */
const nodeScheduler = require('node-schedule');
const ncp = require('ncp').ncp;
const moment = require('moment');
const exec = require('child-process-promise').exec;

let sourceAddress = '../public/documents';
let destinationAddress = '../public/backups/documents';
let limitDepth = 10;

let setup = (source_addr, dest_addr, limit_depth) => {
  sourceAddress = (source_addr) ? source_addr : sourceAddress;
  destinationAddress = (dest_addr) ? dest_addr : destinationAddress;
  ncp.limit = (limit_depth) ? limit_depth : limitDepth;


  fileBackup();
};

let fileBackup = () => {
  nodeScheduler.scheduleJob('* * * * 5', () => {
    ncp(sourceAddress, destinationAddress + moment().format('YYYY-MM-DD'), (err) => {
      if(err){
        return console.error(err);
      }

      console.log('Files backup is completed :)');
    });
  });
};

let setupDropBox = () => {

};

let dbBackup = () => {
  //Please set variables in pg_backup.config
  if(process.platform === 'win32'){
    //See instruction in https://wiki.postgresql.org/wiki/Automated_Backup_on_Windows
    //Then replace the address of bat file with statement in the exec function (ADDRESS OF THE BAT FILE)

    nodeScheduler.scheduleJob('* * * * 5', () => {
      exec('ADDRESS OF THE BAT FILE')
        .then(res => {
          console.log('Postgres backup is completed');
        })
        .catch(err => {
          console.log('Cannot backup postgres database. ', err);
        })
    });
  }
  else{
    //If you want to have expired backups replace command in exec function with './postgres.Config/linux/pg_backup.sh'

    exec('./postgres.Config/linux/pg_backup_rotated.sh')
      .then(res => {
        console.log('Postgres backup is completed');
      })
      .catch(err => {
        console.log('Cannot backup postgres database. ', err);
      });
  }
};


module.exports = {
  setup,
  dbBackup
};