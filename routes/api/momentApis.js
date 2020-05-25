const express = require("express");
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../common/ormConfiguration');
const errorResBody = require('../middware/errorResponse');
const units = require('../common/units');
const getNowFormatDate = units.getNowFormatDate;
const Moment = require('../models/moment');
const Resource = require('../models/resource');
const Busker = require('../models/busker');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const authenticationCheckMiddware = require('../middware/generalAuthentication');

const allMometnsBody = require('../common/responsJsonFormat/getAllMoments.json');
const request = require('request');

// router.use('/',(req, res, next) => {
//     authenticationCheckMiddware(req, res, next, 'busker signed!');
// });
router.post('/add',(req,res)=>{

    // 参数获取
    buskerId = typeof req.body.buskerId === "number" ? req.body.buskerId : -1;
    address = typeof req.body.address === "string" ? req.body.address : -1;
    content = typeof req.body.content === "string" ? req.body.content : -1;
    postTime = typeof req.body.postTime === "number" ? req.body.postTime : -1;
    //optional parameters
    images =  typeof req.body.images === "undefined" ? -1 : req.body.images;
    videos = typeof req.body.videos === "undefined" ? -1 : req.body.videos;
    momentTrend = typeof req.body.tendency === "number" ? req.body.tendency : 0;

    //参数验证
    if(buskerId === -1 || address === -1 || content === -1 || postTime === -1){
        errorResBody(res, '必选参数缺少或类型错误');
        return;
    }

    //数据库操作
    Busker.findOne({where: {busker_id: buskerId}})
    .then(busker => {
        if(busker === null){
            return errorResBody(res, '请检查数据完整性，该busker:' + buskerId + '尚未注册');
        }
        else{
            momentModelInstance = Moment.build({busker_id: buskerId, moment_published_time: postTime, 
                moment_content: content, moment_trend: momentTrend, moment_published_address: address});
            if(videos === -1 && images === -1){
                errorResBody(res, '请至少为moment添加一张图片或者一个视频');
                return;
            }
            momentModelInstance.save()
            .then(async anotherTask => {
               // 向reource 表中插入moment的video数据
               if((videos !== -1 && videos.length > 0) || (images !== -1 && images.length > 0)){
                    for(let i = 0; i < videos.length; i++){
                        videoModelInstance = await Resource.findOne({where:{resource_id: videos[i].resourceId}});
                        videoModelInstance.update({resource_object_id: momentModelInstance.moment_id})
                        .catch(error => {
                            console.log(error);
                            errorResBody(res, '数据库操作出错');
                            return;
                    });
            
                    }
                    for(let j = 0; j < images.length; j++){
                        imageModelInstance = await Resource.findOne({where:{resource_id: images[j].resourceId}});
                        imageModelInstance.update({resource_object_id: momentModelInstance.moment_id})
                        .then(()=> {
                            if(j >= images.length-1){
                                res.status(200).json(generalResBody);
                                return;
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            errorResBody(res, '数据库操作出错');
                            return;
                        });
                        
                    }
                }
                else{
                    res.status(200).json(generalResBody);
                    return;
                }
            })
            .catch(error => {
                console.log(error);
                errorResBody(res, '数据库操作出错')
                return;
            });
        }
    })
    .catch(error => {
        console.log(error);
        return errorResBody(res, '数据库错误');
    });

  
});
router.post('/delete', (req, res) => {
    const momentId = typeof req.body.momentId === "number" ? req.body.momentId : -1;
    if(momentId === -1){
        return errorResBody(res, '参数不正确');
    }
    
    Moment.findOne({where: {moment_id: momentId, moment_status: {[Sequelize.Op.or]: [1, 2, 3]}}})
    .then(moment => {
        if(moment !== null){
            moment.update({moment_status: 4})
            .then(() => {
                return res.status(200).json(generalResBody);
            })
            .catch(error => {
                console.log(error);
                return errorResBody(res, '数据库错误');
            });
        }
        else{
            return errorResBody(res, '数据库中没有 momentId:' + momentId + '的记录');
        }
    })
    .catch(error => {
        console.log(error);
        return errorResBody(res, '数据库错误');
    });

}); 
router.post('/detail', async (req, res) => {
    //request参数获取、验证
    let momentId = typeof parseInt(req.body.momentId) === "number" ? req.body.momentId : -1;
    if(momentId === -1){
        return errorResBody(res, '参数不正确');
    }
    // First, we start a transaction and save it into a variable
    const t = await sequelize.transaction();    
    try {
            //开始事务
            const moment = await Moment.findOne(
                {where: {moment_id: momentId, moment_status: {[Sequelize.Op.or]: [1, 2, 3]}}},
                { transaction: t });
            //参数错误处理
            if(moment === null)
                return errorResBody(res, '没有id为：' + momentId + '的moment记录');

            const busker = await Busker.findOne(
                {where: {busker_id: moment.busker_id}},
                { transaction: t });
            if(busker === null)
                return errorResBody(res, 'id为：' + moment.moment_id + '的moment没有对应的busker，请检查数据完整性');
            
            const resources = await Resource.findAll({where: {resource_object_id: moment.moment_id, 
                resource_type_id:{[Sequelize.Op.or]: [3, 6]}, resource_status: 1}},
                { transaction: t });
            await moment.update({moment_visits: moment.moment_visits + 1}, {transaction: t});
            //提交事务
            await t.commit();
           
            //赋值语句
            let momentDetailRes = null;
            momentDetailRes = require('../common/responsJsonFormat/momentDetailRes.json');
            momentDetailRes.data.moment.videos = [];
            momentDetailRes.data.moment.images = [];
            momentDetailRes.data.moment.id = moment.moment_id;
            momentDetailRes.data.moment.time = moment.moment_published_time;
            momentDetailRes.data.moment.describe = moment.moment_content;
            momentDetailRes.data.moment.address = moment.moment_published_address;
            momentDetailRes.data.moment.tendency = moment.moment_trend;
            momentDetailRes.data.moment.buskerName = busker.busker_nick_name;
            //新增字段
            momentDetailRes.data.moment.buskerId = moment.busker_id;
            //赋值images, videos 字段
            for(let i = 0; i < resources.length; i++){
                switch(resources[i].resource_type_id){
                    case 3:
                        {
                            var videoResource = {
                                "id": -1,
                                "videoUrl": "xxx"
                            }
                            videoResource.id = resources[i].resource_id;
                            videoResource.videoUrl = resources[i].resource_url;
                            momentDetailRes.data.moment.videos.push(videoResource);
                        }
                        break;
                    case 6:
                        {
                            var imageResource = {
                                "id": -1,
                                "imageUrl": "xxx"
                            }
                            imageResource.id = resources[i].resource_id;
                            imageResource.imageUrl = resources[i].resource_url;
                            momentDetailRes.data.moment.images.push(imageResource);
                        }
                        break;
                    default:
                        break;
                }
            }
            //响应请求
            res.status(200).json(momentDetailRes);
            //销毁堆变量
            momentDetailRes = null;
            return;

    } catch (error) {
        // If the execution reaches this line, an error was thrown.
        // We rollback the transaction.
        console.log(error);
        //响应请求
        errorResBody(res,'数据库事务错误');
        return await t.rollback();
    }
});
router.get('/moments', (req, res) => {
    let cookieValue = req.cookies.defaultTimeLost === undefined ? -1 : req.cookies.defaultTimeLost;
    Moment.findAll({attributes: ['moment_id']},{where: {moment_status: {[Sequelize.Op.or]: [1, 2, 3]}}}).then(moments=> {
        if(moments.length === 0){
            return errorResBody(res,'没有符合条件的moment记录');
        }
        else{

            return getAllMoments(moments, res, cookieValue);
        }
    })
    .catch(error => {
        console.log(error);
        return errorResBody(res,'数据库错误');
    })
});
//根据busker的id获取他的动态
router.post('/buskerId' , async (req, res, next) => {
    let cookieValue = req.cookies.defaultTimeLost === undefined ? -1 : req.cookies.defaultTimeLost;
    let buskerId = typeof parseInt(req.body.buskerId) === "number" ? req.body.buskerId : -1;
    if(buskerId === -1){
        return errorResBody(res, '参数错误');
    }

    Moment.findAll({attributes: ['moment_id']},{where: {moment_status: {[Sequelize.Op.or]: [1, 2, 3]}, busker_id: buskerId}})
    .then(moments=> {
        if(moments.length === 0){
            return errorResBody(res,'没有符合条件的moment记录');
        }
        else{
            return getAllMoments(moments, res, cookieValue);
        }
    })
    .catch(error => {
        console.log(error);
        return errorResBody(res,'数据库错误');
    });

})
async function getAllMoments(moments, res, cookieValue){
    let momentsList = [];
    for(let i = 0; i < moments.length; i++){
        let momentInfoById = await getMomentByid(moments[i].moment_id, cookieValue);
        if(momentInfoById.code === 400){
            return errorResBody(res, momentInfoById.data);
        }
        else{
            momentsList.push(momentInfoById.data);
        }
        
    }
    allMometnsBody.data.momentList = momentsList;
    return res.status(200).json(allMometnsBody);
}

function getMomentByid(momentId, cookieValue) {
    return new Promise((resolve) => {
        const j = request.jar();
        const cookie = request.cookie('defaultTimeLost=' + cookieValue);
        const url = 'http://localhost:3001/api/moment/detail';
        j.setCookie(cookie, url);
        request.post({url: url, jar: j, form: {momentId: momentId}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.moment});
            }
            if(response.statusCode === 400){

                resolve({code: 400, data: bodyJson.data.message});
            }
            if(error){
                resolve({code: -1, data: '请求转发错误'});
            }
        });
      }
    )
  }
  
module.exports = router;
