// const db = require('mysql');
// const con = db.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"120788",
//     database:"buskers"
// });


const dbV2 = require('mysql');
const con2 = dbV2.createConnection({
    host:"localhost",
    user:"root",
    password:"120788",
    database:"buskerv2"
});
module.exports = con2;
