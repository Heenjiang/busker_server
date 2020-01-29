const express = require("express");
const router = express.Router();
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');
const formidable = require('formidable');
const trailList =  '{"trailList": [{"id": "","time": "","name": "","address": "","describe": "","imgUrl": ""}]}';

//获取时间
function getNowFormatDate() {
    let date = new Date();
    let seperator1 = "-";
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + seperator1 + date.getHours() + seperator1 + date.getMinutes() + seperator1 + date.getSeconds() +seperator1 + date.getMilliseconds();
    return currentdate.toString();
}
router.get('/trailList',(req, res)=> {
    const object = JSON.parse(trailList);
    const pageId = req.query.page;
    con.query(sql.getTrailList, (err, result) => {
        if(err) res.status(400).json({"info":" illegal request!!!! "});
        for (let i = 0; i < result.length; i++){
            object['trailList'].unshift({"id": result[i].trail_id,"time": result[i].perform_time,"name": result[i].participant,"address": result[i].perform_address,"describe": result[i].describe,"imgUrl": result[i].path });
        }
        object['trailList'].pop();
        res.status(200).json({"success":true, "data":{"trailList":object['trailList'].slice((pageId-1)*5,(pageId-1)*5+5),"totalNum":object['trailList'].length}});
    });
});
router.get('/getTrailsByBuskerId',(req, res)=> {
    const object = JSON.parse(trailList);
    const buskerId = req.query.id;
    con.query(sql.getTrailsByBuskerId + buskerId + ";", (err, result) => {
        if(err) res.status(400).json({"info":" illegal request!!!! "});
        for (let i = 0; i < result.length; i++){
            object['trailList'].unshift({"id": result[i].trail_id,"time": result[i].perform_time,"name": result[i].participant,"address": result[i].perform_address,"describe": result[i].describe,"imgUrl": result[i].path });
        }
        object['trailList'].pop();
        res.status(200).json({"success":true, "data":object});
    });
});
router.get('/trailDetail', (req, res)=>{
    const id = req.query.id;
    const object = JSON.parse(trailList);
    con.query(sql.getTrailById + id + ";",(err, result)=>{
        object['trailList'].unshift({"id": result[0].trail_id,"time": result[0].perform_time,"name": result[0].participant,"address": result[0].perform_address,"describe": result[0].describe,"imgUrl": result[0].path });
        object['trailList'].pop();
        res.status(200).json({"success":true, "data":{"trail":object['trailList'][0]}});
    });
});
router.post('/addTrail',(req,res)=>{
    const publishedTime = new Date();
    const params = [req.body.buskerId,req.body.participant,req.body.time,req.body.address,publishedTime,req.body.poster,req.body.describe];
    con.query(sql.insertTrail,params,(err, result)=>{
        if(err) res.status(400).json({"message":err.toString()});
        else{
            res.status(200).json({"success":true, "data":{"code":0}});
        }
    });

});
router.post('/addTrailImage', (req,res)=>{
    let form_update = new formidable.IncomingForm(); //创建上传表单
    form_update.encoding = 'utf-8'; //设置编码格式
    form_update.uploadDir = 'public/images'; //文件上传，设置临时上传目录
    form_update.keepExtensions = true; //保留后缀
    form_update.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    const typeImage = 2;//1 默认是icon， 2 是poster， 3 是moments中的图片
    form_update.parse(req)
        .on ('fileBegin', function(name, file){
            file.path = form_update.uploadDir  + "/poster" + "/" + getNowFormatDate()+".jpg";
        })
        .on('file', (name, file) => {
            let params = ['', typeImage];
            params[0] = "/" +file.path;
            con.query(sql.insertImage,params,(err, result)=>{
                if(err)res.status(400).json(err.toString());
                else{
                    if(result) {
                        con.query(sql.getImageIdByPath, params[0], (err, result)=>{
                            if(err) res.status(400).json({"message":"在根据path查询imageid的时候数据库出错了！！！"});
                            else{
                                res.status(200).json({"imageId":result[0].image_id, "imagePath": params[0]});
                            }
                        });
                    }
                }
            });
        })
});
module.exports = router;
