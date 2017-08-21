/**
 * Created by ali71 on 20/08/2017.
 */
const nodeScheduler = require('node-schedule');
const moment = require('moment');
const exec = require('child-process-promise').exec;
const AdmZip = require('adm-zip');
const Dropbox = require('dropbox');
const fs = require('fs');

let sourceAddress = '../public/documents';
let destinationAddress = '../public/backups/documents';
let destinationFileName = '';
let accessKey = '';
let dpx = null;

let setup = (source_addr, dest_addr, dropbox_access_key) => {
  sourceAddress = (source_addr) ? source_addr : sourceAddress;
  destinationAddress = (dest_addr) ? dest_addr : destinationAddress;

  accessKey = dropbox_access_key;

  fileBackup();
};

let fileBackup = () => {
  nodeScheduler.scheduleJob('* * * * 5', () => {
    //Create archive file (.zip)
    let zip = new AdmZip();
    zip.addLocalFolder(sourceAddress);

    destinationFileName = moment.format('YYYY-MM-DD') + '.zip';

    zip.writeZip(destinationAddress + '/' + destinationFileName);

    fileUpload();
  });
};

let fileUpload = () => {
  dpx = new Dropbox({accessToken: accessKey});

  fs.readFile(destinationAddress + '/' + destinationFileName, (err, data) => {
    if(err)
      console.log('Error. Cannot read zip file. ', err);

    dpx.filesUpload({path: '/backups/' + destinationFileName, contents: data})
      .then(res => {
        console.log(destinationFileName + ' is uploaded');
      })
      .catch(err => {
        console.log('Error. Cannot upload zip file. ', err);
      });
  });
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