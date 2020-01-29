const db = require('mysql');
const con = db.createConnection({
    host:"localhost",
    user:"root",
    password:"120788",
    database:"buskers"
});
module.exports = con;
