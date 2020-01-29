const express = require("express");
const router = express.Router();
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');

router.get('/', (req,res)=>{
    con.query(sql.getBuskerInfoById, req,query.id, (err, result)=>{
       if(err) res.status(400).json({"message":err.toString()});
       else{
           router.use('/api/login',login)
       }
    });
});
module.exports = router;
