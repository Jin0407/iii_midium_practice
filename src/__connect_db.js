const mysql = require('mysql');
const bluebird = require('bluebird');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1qaz(OL>',
    database: 'fb'
});

// 錯誤處理
db.on('error', function(ex){
    console.log('ex:', ex);
});



db.connect();

bluebird.promisifyAll(db);


module.exports = db;