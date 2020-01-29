const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');
// const moment =  '{"momentList": [{"id": "","time": "","name": "","address": "","describe": "", "tendency": "","imgUrl": [{"url": ""}],"videoUrl": [{"url": ""}]}]}';
const moment =  '{"momentList": [{"id": "","time": "","buskerName": "","address": "","describe": "", "tendency": "","images": [{"id": "","imageUrl":""}],"videos": [{"id": "","videoUrl":""}]}]}';
router.get('/momentList',(req, res)=> {
    const object = JSON.parse(moment);
    const pageId = req.query.page;
    con.query(sql.getPerformanceList, (err, result, field) => {
        if(err) res.status(400).json({"info":" illegal request!!!! "});
        for (var i = 0; i < result.length; i++){
           object['momentList'].unshift({"id": result[i].moment_id,"time": result[i].post_time,"buskerName": result[i].nick_name,"address": result[i].address,"describe": result[i].content,"tendency":result[i].tendency,"images": [{"id": "","imageUrl":""}],"videos": [{"id": "","videoUrl":""}]});
        }
        object['momentList'].pop();
    });
    con.query(sql.getPoster, (err, result,field)=>{
        if(err) throw err;
       for (let i = 0; i < result.length;i++){
           for(let j = 0; j < object['momentList'].length; j++){
               if(result[i].moment_id == object['momentList'][j].id){
                   object['momentList'][j]['images'].unshift({"id": result[i].image_id,"imageUrl":result[i].path});
                   break;
               }
           }
       }
       //delete the last empty element in the array
        for(let j = 0; j < object['momentList'].length; j++){
            object['momentList'][j]['images'].pop();
        }
    });
    con.query(sql.getVideoUrl,(err, result, field)=>{
        if(err) throw  err;
        for (let i = 0; i < result.length;i++){
            for(let j = 0; j < object['momentList'].length; j++){
                if(result[i].moment_id == object['momentList'][j].id){
                    object['momentList'][j]['videos'].unshift({"id": result[i].video_id,"videoUrl":result[i].url});
                    break;
                }
            }
        }
        //delete the last empty element in the array
        for(let j = 0; j < object['momentList'].length; j++){
            object['momentList'][j]['videos'].pop();
        }
        console.log(object['momentList']);
        res.status(200).json({"success":true, "data":{"momentList":object['momentList'].slice((pageId-1)*5,(pageId-1)*5+5),"totalNum":object['momentList'].length}});
        res.end();
    });

});
router.get('/getMomentsByBuskerId',(req,res)=>{
    const id = req.query.id;
    const object = JSON.parse(moment);
    con.query(sql.getMomentsByBuskerId + id + ";", (err, result, field) => {
        if(err) res.status(400).json({"info":" illegal request!!!! "});
        for (let i = 0; i < result.length; i++){
            object['momentList'].unshift({"id": result[i].moment_id,"time": result[i].post_time,"buskerName": result[i].nick_name,"address": result[i].address,"describe": result[i].content,"tendency":result[i].tendency,"images": [{"id": "","imageUrl":""}],"videos": [{"id": "","videoUrl":""}]});
        }
        object['momentList'].pop();
    });
    con.query(sql.getPoster, (err, result,field)=>{
        if(err) throw err;
        for (let i = 0; i < result.length;i++){
            for(let j = 0; j < object['momentList'].length; j++){
                if(result[i].moment_id == object['momentList'][j].id){
                    object['momentList'][j]['images'].unshift({"id": result[i].image_id,"imageUrl":result[i].path});
                    break;
                }
            }
        }
        //delete the last empty element in the array
        for(let j = 0; j < object['momentList'].length; j++){
            object['momentList'][j]['images'].pop();
        }
    });
    con.query(sql.getVideoUrl,(err, result, field)=>{
        if(err) throw  err;
        for (let i = 0; i < result.length;i++){
            for(let j = 0; j < object['momentList'].length; j++){
                if(result[i].moment_id == object['momentList'][j].id){
                    object['momentList'][j]['videos'].unshift({"id": result[i].video_id,"videoUrl":result[i].url});
                    break;
                }
            }
        }
        //delete the last empty element in the array
        for(let j = 0; j < object['momentList'].length; j++){
            object['momentList'][j]['videos'].pop();
        }
        res.status(200).json({"success":true, "data":object});
    });

});
router.get('/momentDetail', (req, res)=>{
    const object = JSON.parse(moment);
    const id = req.query.id;
    con.query(sql.getPerformanceDetail+id+";", (err, result, field) => {
        if(err) res.status(400).json({"info":" illegal request!!!! "});
        object['momentList'].unshift({"id": result[0].moment_id,"time": result[0].post_time,"buskerName": result[0].nick_name,"address": result[0].address,"describe": result[0].content,"tendency":result[0].tendency,"images": [{"id": "","imageUrl":""}],"videos": [{"id": "","videoUrl":""}]});
        object['momentList'].pop();
    });
    con.query(sql.getPerformancePoster+id+";", (err, result,field)=>{
        if(err) throw err;
        for (let i = 0; i < result.length;i++){
            console.log(object['momentList'][i]);
            object['momentList'][0]['images'].unshift({"id": result[i].image_id,"imageUrl":result[i].path});
        }
        //delete the last empty element in the array
        object['momentList'][0]['images'].pop();
    });
    con.query(sql.getVideoUrlByPerformanceId + id + ";",(err, result, field)=>{
        if(err) throw err;
        for (let i = 0; i < result.length;i++){
            object['momentList'][0]['videos'].unshift({"id": result[i].video_id,"videoUrl":result[i].url});
        }
        //delete the last empty element in the array
        object['momentList'][0]['videos'].pop();
        res.status(200).json({"success":true, "data":{"moment":object['momentList'][0]}});
    });

});
router.post('/addMomentImages',(req, res)=>{
    let momentId = req.body.momentId;
    let form = new formidable.IncomingForm();
    form.uploadDir = 'public/images/temporary';   //文件保存在系统临时目录
    form.maxFieldsSize = 1 * 1024 * 1024;  //上传文件大小限制为最大1M
    form.keepExtensions = true;        //使用文件的原扩展名

    let targetDir = '././public/images/moments';
    // 检查目标目录，不存在则创建
    fs.access(targetDir, function(err){
        if(err){
            fs.mkdirSync(targetDir);
        }

        form.parse(req, function (err, fields, files) {
            if (err) throw err;
            const  imageType = 3;
            var filesUrl = [];
            var errCount = 0;
            var keys = Object.keys(files);
            let imageId = -1;
            const keysLength = keys.length;
            let count = 0;
            keys.forEach(function(key){
                let filePath = files[key].path;
                let imageId = 1;
                let fileExt = filePath.substring(filePath.lastIndexOf('.'));
                if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
                    errCount += 1;
                }
                else {
                    //以当前时间戳对上传文件进行重命名
                    var fileName = new Date().getTime() + fileExt;
                    var targetFile = path.join(targetDir, fileName);
                    //移动文件
                    fs.renameSync(filePath, targetFile);
                    // 文件的Url（相对路径）
                    let filepath = ("/" + targetFile.toString()).replace(/\\/g,"\/");
                    let params = [filepath,imageType];
                    con.query(sql.insertImage,params,(err, result)=>{
                        if(err) res.status(400).json({"message":err.toString()})
                    });
                    con.query(sql.getImageIdByPath, filepath, (err, result)=>{
                        if(err) res.status(400).json({"message":err.toString()});
                        else {
                            imageId = result[0].image_id;
                            count++;
                            filesUrl.push({"imageId":imageId, "imageUrl":filepath});
                            res.status(200).json({"success":true, "data":filesUrl});

                        }
                    });
                }
            });
        });
    });
});
router.post('/addMoment',(req,res)=>{
    console.log(req.body);
    const params = [req.body.buskerId, req.body.postTime, req.body.content, 1, parseInt((Math.random()*1000).toString()),req.body.address];
    const videoList = req.body.video;
    const imageList = req.body.image;
    const postTime = req.body.postTime;

    //添加到moments table中
    con.query(sql.addMoment,params,(err, result)=>{
        if(err) res.status(400).json({"message":err.toString()});
        else{
            //添加到video_url table中
            con.query(sql.getMomentIdByPostTime, postTime,(err,result)=>{
                if(err) res.status(400).json({"message":err.toString()});
                else {
                    const momentId = result[0].moment_id;
                    for(let i = 0; i < videoList.length; i++){
                        const videoParams = [videoList[i].videoPath, momentId];
                        con.query(sql.addVideo,videoParams, (err, result)=>{
                            if(err) res.status(400).json({"message":err.toString()});
                        });
                    }
                    for (let i  = 0; i < imageList.length; i++){
                        const imageParams = [imageList[i].id, momentId];
                        con.query(sql.addMomentImageTable,imageParams, (err, result)=>{
                            if(err) res.status(400).json({"message":err.toString()});
                            else{
                                if(i == imageList.length-1){
                                    res.status(200).json({"success":true, "data":{"code":0}});
                                }
                            }
                        });
                    }
                }
            });
        }
    });

});

module.exports = router;
