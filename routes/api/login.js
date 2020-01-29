const express = require('express');
const router = express.Router();
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');
const loginJson = '{"isLogged":"", "currentUser": {"id": "", "username":"", "typeId": "","imgUrl":""}}';

router.get('/login',(req,res)=>{
    const username = req.query.username;
    console.log(username);
    const password = req.query.password;

    let query = con.query(sql.getUserByUsername ,username , (err, result)=>{
        const object = JSON.parse(loginJson);
        if (err) res.status(400).json({"message":"Bad Request!!!"});
        else{
            if(result.length <= 0){
                console.log(result.sql);
                res.status(200).json({"success": false, "data":{"isLogged":false, "message":"Username not exist in DB!!"}})
            }
            else if(result[0]['password'] !== password){
                console.log(result);
                res.status(200).json({"success": false, "data":{"isLogged":false, "message":"Password incorrect!!"}});
            }
             else{
                object.isLogged = true;
                object.currentUser['id'] = result[0].user_id;
                object.currentUser['username'] = username;
                object.currentUser['typeId'] = result[0].type_id;
                object.currentUser['imgUrl'] = result[0].path;
                res.status(200).json({"success": true, "data":object});
            }
        }
    });
});
module.exports = router;
