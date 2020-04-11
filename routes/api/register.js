const express = require('express');
const router = express.Router();
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');
const sequelize = require('../common/ormConfiguration');

router.post('/register',(req, res)=>{
   const username = req.body.username;
   const password = req.body.password;
   const type = req.body.type;
   const  imagePathId = 1;
   const params = [username,password,type,imagePathId];

   con.query(sql.insertUser,params,(err, result)=>{
      if(err) res.status(200).json({"Message":err.toString()});
      else{
          res.status(200).json({"success":true,"data":{"code":0}});
      }
   });
});

module.exports = router;
