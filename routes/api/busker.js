const express = require("express");
const router = express.Router();
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');
const fs = require('fs');
const buskerdetail = require('../common/json/buskerDetail');
const formidable = require('formidable');
const buskerList = require('../common/json/buskerList');
const busker = '{"buskerList": [{"id": 1, "imgUrl": "/img/a.png", "buskerName": "Busker", "age": 23, "sex": 1, "instrument": "Guitar, Piano", "introduce": "introduce", "recentPerform": "", "tendencyAllHot": 0}]}';
const request = require('request');
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
router.get('/buskerList',(req, res)=> {
    const object = JSON.parse(busker);
    const pageId = req.query.page;
    con.query(sql.getBuskerList, (err, result, field) => {
        if (err) res.status(400).json({"info":" illegal request!!!! "});
        else{
            for (let i = 0; i < result.length; i++){
                const birthday = result[i].date_of_birth;
                const dateEnd = new Date();
                const dateDiff = dateEnd.getTime() - birthday.getTime();
                const age = parseInt(dateDiff / (24*3600*1000*365));
                object['buskerList'].unshift({"id": result[i].user_id, "imgUrl": result[i].path, "buskerName": result[i].nick_name, "age": age, "sex": result[i].sex, "instrument": result[i].instruments, "introduce": result[i].introduction, "recentPerform": "", "tendencyAllHot": 0});
            }
            object['buskerList'].pop();
            con.query(sql.getRecentPerformDate,(err, result,field)=>{
                if (err) res.status(400).json({"info":" illegal request!!!! "});
                else{
                    for(let i = 0; i < result.length; i++){
                        for (let j = 0; j <  object['buskerList'].length; j++){
                            if( object['buskerList'][j].id == result[i].busker_id)
                                object['buskerList'][j].recentPerform = result[i].recentPerform;
                        }
                    }
                    con.query(sql.getTendencyValue,(err, result,field)=>{
                        if (err) res.status(400).json({"info":" illegal request!!!! "});
                        else{
                            for(let i = 0; i < result.length; i++){
                                for (let j = 0; j <  object['buskerList'].length; j++){
                                    if (object['buskerList'][j].id == result[i].busker_id)
                                        object['buskerList'][j].tendencyAllHot = result[i].tendencyAllHot;
                                }
                            }
                            console.log(object['buskerList'].length);
                            res.status(200).json({"success":true, "data":{"buskerList":object['buskerList'].slice((pageId-1)*10,(pageId-1)*10+10),"totalNum":object['buskerList'].length}});
                            res.end();
                        }
                    });
                }
            });

        }
    });
});
router.get('/buskerDetail',(req, res)=>{
    const id = req.query.id;
    let trails = [];
    let moments =[];
    const getMomentsIdSql = sql.getMomentsId + id + ";";
    const getTrailIdSql = sql.getTrailId + id + ";";
    const getBuskerDetailSql = sql.getBuskerDetails + id + ";";
    const query = con.query(getBuskerDetailSql, function (err, result, fields) {
            if (err) res.status(400).json({"info":" illegal request!!!! "});
            if(result.length === 0) res.status(400).json({"success":true, "data": null});
            else{
                //calculate age
                const birthday = result[0].date_of_birth;
                const dateEnd = new Date();
                let age = null;
                if(result[0].date_of_birth !== null){
                    const dateDiff = dateEnd.getTime() - birthday.getTime();
                    age = parseInt(dateDiff / (24*3600*1000*365));
                }
                //format json
                buskerdetail.success = true;
                buskerdetail.data.id = parseInt(id);
                buskerdetail.data.imgUrl = result[0].path;
                buskerdetail.data.buskerName = result[0]["nick_name"];
                buskerdetail.data.sex = result[0].sex;
                buskerdetail.data.age = age;
                buskerdetail.data.instrument = result[0]["instruments"];
                buskerdetail.data.introduce = result[0]["introduction"];
                const request1=request({url:'http://localhost:3001/api/trail/getTrailsByBuskerId?id='+ id,
                    method:'GET',
                    headers:{'Content-Type':'text/json' }
                },function(error,response,body){
                    if(!error && response.statusCode==200){
                        // res.render('task',{'data':JSON.parse(body) });
                        const trailsApi = JSON.parse(body);
                        trails = trailsApi.data.trailList;
                        buskerdetail.data.trails = trails;
                        const request2=request({url:'http://localhost:3001/api/moment/getMomentsByBuskerId?id='+ id,
                            method:'GET',
                            headers:{'Content-Type':'text/json' }
                        },function(error,response,body){
                            if(!error && response.statusCode==200){
                                // res.render('task',{'data':JSON.parse(body) });
                                const momentApi = JSON.parse(body);
                                moments = momentApi.data.momentList;
                                buskerdetail.data.moments = moments;
                                res.status(200).json({"success":buskerdetail.success, "data":{"busker": buskerdetail.data}});
                            }
                        });
                    }
                });
              }
            });
    console.log(query.sql);
});
router.get('/getBusker', (req, res)=>{
    const id = req.query.id;
    let trails = [];
    let moments =[];
    const getMomentsIdSql = sql.getMomentsId + id + ";";
    const getTrailIdSql = sql.getTrailId + id + ";";
    const getBuskerDetailSql = sql.getBuskerDetails + id + ";";
    con.query(getBuskerDetailSql, function (err, result, fields) {
        if (err) res.status(400).json({"info":" illegal request!!!! "});
        if(result.length === 0) res.status(400).json({"success":true, "data": null});
        else{
            //format json
            buskerdetail.success = true;
            buskerdetail.data.id = id;
            buskerdetail.data.imgUrl = result[0].path;
            buskerdetail.data.buskerName = result[0]["nick_name"];
            buskerdetail.data.sex = result[0].sex;
            if(result[0].date_of_birth === null) buskerdetail.data.age = null;
            else buskerdetail.data.age = result[0].date_of_birth.getFullYear()+"-"+result[0].date_of_birth.getMonth()+"-"+result[0].date_of_birth.getDay();
            buskerdetail.data.instrument = result[0]["instruments"];
            buskerdetail.data.introduce = result[0]["introduction"];
            const request1=request({url:'http://localhost:3001/api/trail/getTrailsByBuskerId?id='+ id,
                method:'GET',
                headers:{'Content-Type':'text/json' }
            },function(error,response,body){
                if(!error && response.statusCode==200){
                    // res.render('task',{'data':JSON.parse(body) });
                    const trailsApi = JSON.parse(body);
                    trails = trailsApi.data.trailList;
                    buskerdetail.data.trails = trails;
                }
            });
            const request2=request({url:'http://localhost:3001/api/moment/getMomentsByBuskerId?id='+ id,
                method:'GET',
                headers:{'Content-Type':'text/json' }
            },function(error,response,body){
                if(!error && response.statusCode==200){
                    // res.render('task',{'data':JSON.parse(body) });
                    const momentApi = JSON.parse(body);
                    moments = momentApi.data.momentList;
                    buskerdetail.data.moments = moments;
                }
                res.status(200).json({"success":buskerdetail.success, "data":{"busker": buskerdetail.data}})
            });
        }
    });
});
router.post('/addBusker', (req,res)=>{
    const buskerId = parseInt(req.body.buskerId);
    console.log(req.body);
    const query =  con.query(sql.getBuskerInfoById,buskerId, (err, result)=>{
        if(err) res.status(400).json({"message":err.toString()});
        //新增
        else if(result.length == 0){
            const status = 1;
            var iconId = (req.body.iconId == -1 ? 1 : req.body.iconId);
            var params = [req.body.buskerId, req.body.nickName, req.body.dateOfBirth, req.body.instruments, req.body.introduction, req.body.sex, status];
            let addSql = con.query(sql.addBusker, params, (err, result)=>{
                if(err) res.status(400).json({"message": err.toString()});
                else{
                    con.query(sql.updateUserIcon,[iconId, req.body.buskerId],(err,result)=>{
                        if(err) res.status(400).json({"message": err.toString()});
                    });
                    res.status(200).json({"success":true, "data":{"code": 0}});
                }
            });
            console.log(addSql.sql);

        }
            // 更新
            else{
                console.log("update");
                var iconId = req.body.iconId ;
                var status = 1;
                var params = [req.body.nickName, req.body.dateOfBirth, req.body.instruments, req.body.introduction, req.body.sex, status,req.body.buskerId];
                con.query(sql.updateBusker, params, (err, result)=>{
                    if(err) res.status(400).json({"message": err.toString()});
                    else{
                        if(iconId == -1) res.status(200).json({"success":true, "data":{"code": 0}});
                        else{
                            con.query(sql.updateUserIcon,[iconId, req.body.buskerId],(err,result)=>{
                                if(err) res.status(400).json({"message": err.toString()});
                                else{
                                    res.status(200).json({"success":true, "data":{"code": 0}});
                                }
                            });
                        }

                    }
                });
        }
    });
    console.log(query.sql);
});
router.post('/addBuskerIcon', (req,res)=>{
    let form_update = new formidable.IncomingForm(); //创建上传表单
    form_update.encoding = 'utf-8'; //设置编码格式
    form_update.uploadDir = 'public/images'; //文件上传，设置临时上传目录
    form_update.keepExtensions = true; //保留后缀
    form_update.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    const typeImage = 1;//1 默认是icon， 2 是poster， 3 是moments中的图片
    form_update.parse(req)
        .on ('fileBegin', function(name, file){
            file.path = form_update.uploadDir  + "/icon" + "/" + getNowFormatDate()+".jpg";
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
                                res.status(200).json({"imageId":result[0].image_id, "imagePath":  params[0]});
                            }
                        });
                    }
                }
            });
        })
});
module.exports = router;
