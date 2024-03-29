/**
 * Created by Amin on 31/01/2017.
 */
const env = require('./env');
const sql = require('./sql');
const lib = require('./lib');
const User = lib.User;

function dbTestCreate() {
  return new Promise((resolve, reject) => {
    sql.db.create({dbName: env.test_db_name}, true)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}
function createOrExist(tableName) {
  return lib.helpers.createOrExist(tableName, sql);
}

function prodTablesCreate() {
  return new Promise((resolve, reject) => {
    [
      'users',
      'patients',
      'visits',
      'documents',
      'shares',
      'waiting'
    ].reduce((x, y) => createOrExist(x).then(createOrExist(y)))
      .then(resolve())
      .catch(err => reject(err));
  });
}

function adminRowCreate() {
  return new Promise((resolve, reject) => {
    let user = new User();

    let data = {
      username: 'admin',
      password: 'admin',
    };

    user.insert(data)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function setupMainDatabase(msg) {
  prodTablesCreate()
    .then(() => {
      return adminRowCreate();
    })
    .then(() => {
      if (env.isDev)
        return dbTestCreate();
      else
        process.exit();
    })
    .then(() => process.exit())
    .catch((err) => {
      console.log(err.message);
      process.exit();
    });
}

if (env.isDev) {


  sql.db.create({dbName: env.db_name})
    .then(res => {
      setupMainDatabase(res);
    })
    .catch(err => {
      setupMainDatabase(err.message);
    });
}


