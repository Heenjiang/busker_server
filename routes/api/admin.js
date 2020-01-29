const dbCon = require('../common/dbconfiguration');
const express = require('express');
const router = express.Router();

router.get('/',function (req,res) {
    dbCon.connect(function (err) {
        if(err) throw err;
        res.send("this is admin's infos");
        // dbCon.query("SELECT * FROM ",function (err, result, fields) {
        //     if(err) throw err;
        //     res.send(result);
        // });
    });
});
module.exports = router;
