const express = require("express");
const router = express.Router();
const sequelize = require('../common/ormConfiguration');
const formidable = require('formidable');
const errorRes = require('../middware/errorResponse');
const units = require('../common/units');
const getNowFormatDate = units.getNowFormatDate;
const Trailer = require('../models/trailer');
const Resource = require('../models/resource');
const Busker = require('../models/busker');
const TrailerLike = require('../models/TrailerLike');
const User = require('../models/user');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const authenticationCheckMiddwdeare = require('../middware/generalAuthentication');
const paramsVerifyMiddware = require('../middware/addTrailerParamVerify');
const trailerDetailResBody = require('../common/responsJsonFormat/trailerDetailResBody.json');
const request = require('request');

router.post('/add', async (req, res, next) => {
    paramsVerifyMiddware(req, res, next);

    buskerId =  req.body.buskerId;
    imageReourceId = req.body.resourceId ;
    performingTime = req.body.performingTime;
    publishedTime = req.body.publishedTime;
    performAddress = req.body.address;
    description = req.body.details;
    likes = req.body.like;
    participants = req.body.participant;

    //声明事务
    let t = null;
     t = await sequelize.transaction(); 
    
   try{
        const busker = await Busker.findOne({where: {busker_id: buskerId}},{ transaction: t });
        if(busker === null){
            return errorRes(res, '数据库中没有busker id：' + buskerId + '的记录，请检查数据完整性');
        }
        const resource = await Resource.findOne({where: {resource_id: imageReourceId, resource_type_id:7,
             resource_status: 1}},{ transaction: t });
        if(resource === null){
            return errorRes(res, '数据库中没有trailer的：poster的记录，请检查数据完整性');
        }
        const trailer = await Trailer.build({busker_id: buskerId, trailer_participant: participants,
            trailer_performing_time:performingTime, trailer_perform_adress:performAddress,
            trailer_published_time:publishedTime, trailer_poster:resource.resource_id,
            trailer_description: description, trailer_status:1, trailer_likes: 0 }, { transaction: t });

        // trailer
        await trailer.save({ transaction: t });
        //提交事务
        await t.commit();
        
        res.status(200).json(generalResBody);
        return;

   }catch (error) {
        // If the execution reaches this line, an error was thrown.
        // We rollback the transaction.
        console.log(error);
        //响应请求
        errorRes(res,'数据库事务错误');
        return await t.rollback();
   }
    
});
router.post('/delete', async (req, res, next) => {
    //参数检查
    const trailerId = typeof req.body.trailId === "number" ? req.body.trailId : -1;
    if(trailerId === -1){
       return errorRes(res, '参数错误！');
    }
    //创建事务
    const transaction = await sequelize.transaction(); 
    try {
        const trailer = await Trailer.findOne({where: {trailer_id: trailerId}},{transaction: transaction});
        if(trailer === null){
            errorRes(res, '该记录在数据库中不存在哦');
            return;
        }
        await trailer.update({trailer_status: 2}, {transaction: transaction});
        
        //提交事务
        await transaction.commit();

        //发送响应
        return res.status(200).json(generalResBody);
    } catch (error) {
        //事务失败需要回滚
        console.log(error);
        errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
        return await transaction.rollback();
    }
}); 

router.post('/detail', async (req, res, next) => {
    //参数检查
    const trailerId = typeof parseInt(req.body.trailId) === "number" ? parseInt(req.body.trailId) : -1;
    if(trailerId === -1 || isNaN(trailerId)){
       return errorRes(res, '参数错误！');
    }
    const userId = (typeof parseInt(req.body.userId) === "number") && !isNaN(parseInt(req.body.userId)) ? parseInt(req.body.userId) : -1;
    
    //创建事务
    const transaction = await sequelize.transaction();
    try {
        const trailer = await Trailer.findOne({where: {trailer_id: trailerId}},{transaction: transaction});
        if(trailer === null){
            return  errorRes(res, '该记录在数据库中不存在哦');
        }        
        const imageReource = await Resource.findOne({where: {resource_id: trailer.trailer_poster, resource_status:1}},
            {transaction: transaction});
        if(userId !== -1 && !isNaN(trailerId)){
            const trailerLike = await TrailerLike.findOne({where:{trailer_id: trailerId, register_id: userId, status:1}});
            if(trailerLike !== null){
                console.log(trailerLike)
                trailerDetailResBody.data.isLike = true;
            }
        }
        const busker = await Busker.findOne({where:{busker_id: trailer.busker_id}});
        const user = await User.findOne({where:{user_id: trailer.busker_id}});
        await trailer.update({trailer_visits: trailer.trailer_visits + 1}, {transaction: transaction});
        //提交事务
        await transaction.commit();

        //赋值
        trailerDetailResBody.data.trail.id = trailer.trailer_id;
        trailerDetailResBody.data.trail.buskerId = trailer.busker_id;
        trailerDetailResBody.data.trail.performingTime = trailer.trailer_performing_time;
        trailerDetailResBody.data.trail.publishedTime = trailer.trailer_published_time;
        trailerDetailResBody.data.trail.performAddress = trailer.trailer_perform_adress;
        trailerDetailResBody.data.trail.describe = trailer.trailer_description;
        trailerDetailResBody.data.trail.imgUrl = imageReource ? imageReource.resource_url: -1;
        trailerDetailResBody.data.trail.participant = trailer.trailer_participant;
        trailerDetailResBody.data.trail.likes = trailer.trailer_likes;

        //新增字段
        trailerDetailResBody.data.trail.buskerName = busker.busker_nick_name;
        trailerDetailResBody.data.trail.buskerImg = user.icon_path;
        trailerDetailResBody.data.trail.status = trailer.trailer_status;

        return res.status(200).json(trailerDetailResBody);
    } catch (error) {
        //事务失败需要回滚
        console.log(error);
        errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
        return await transaction.rollback();
    }
});

router.get('/trailers', async (req, res, next) => {
    let url = 'http://localhost:3001/api/trail/detail';
    let cookieValue = req.cookies.defaultTimeLost === undefined ? -1 : req.cookies.defaultTimeLost;
    const transaction = await sequelize.transaction();
    try {
        const trailersId = await Trailer.findAll({attributes: ['trailer_id']},
         {where: {trailer_status: 1}}, {transaction: transaction});
         
         transaction.commit();
         return getAllTailers(trailersId, res, url, cookieValue);
    } catch (error) {
         //事务失败需要回滚
         console.log(error);
         errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
         return await transaction.rollback();
    }
    
});
//根据busker获取trailers
router.post('/buskerId', async (req, res, next) => {
    let url = 'http://localhost:3001/api/trail/detail';
    let cookieValue = req.cookies.defaultTimeLost === undefined ? -1 : req.cookies.defaultTimeLost;
    let buskerId = typeof parseInt(req.body.buskerId) === "number" ? parseInt(req.body.buskerId) : -1;
    if(buskerId === -1){
        return errorRes(res, '参数错误');
    }

    const transaction = await sequelize.transaction();
    try {
        const trailersId = await Trailer.findAll({attributes: ['trailer_id']},
         {where: {trailer_status: 1, busker_id: buskerId}}, {transaction: transaction});
         
         transaction.commit();
         return getAllTailers(trailersId, res, url, cookieValue);
    } catch (error) {
         //事务失败需要回滚
         console.log(error);
         errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
         return await transaction.rollback();
    }
    
});
router.post('/like', async (req, res, next)=>{
    const userId = req.body.userId;
    const trailerId = req.body.trailerId;

    const transaction = await sequelize.transaction();

    try {
        let trailer = await Trailer.findOne({where:{trailer_id: trailerId}}, {transaction:transaction});
        await trailer.update({trailer_likes: trailer.trailer_likes + 1}, {transaction:transaction});
        await trailer.save({transaction:transaction});
        const time = new Date().getTime();
        const trailerLike = await TrailerLike.build({register_id: userId, trailer_id: trailerId,
             register_click_time: time}, {transaction:transaction});
        await trailerLike.save({transaction:transaction});
        await transaction.commit();
        return res.status(200).json(generalResBody);
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return errorRes(res, "数据库操作错误"+error);
    }
});
async function getAllTailers(trailers, res, url, cookieValue){
    let allTrailersBody = require('../common/responsJsonFormat/allTrailers.json');
    let trailerList = [];
    for(let i = 0; i < trailers.length; i++){
        let trailerInfoById = await getTrailerByid(trailers[i].trailer_id, url, cookieValue);
        if(trailerInfoById.code === 400){
            return errorRes(res, trailerInfoById.data);
        }
        else{
            trailerList.push(trailerInfoById.data);
        }
        
    }
    allTrailersBody.data.trailList = trailerList;
    res.status(200).json(allTrailersBody);
    return ;
}

function getTrailerByid(trailerId, url, cookieValue) {
    return new Promise((resolve) => {
        const j = request.jar();
        const cookie = request.cookie('defaultTimeLost=' + cookieValue);
        j.setCookie(cookie, url);
        request.post({url: url, jar: j, form: {trailId: trailerId}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.trail});
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
router.post('/addTrailImage', (req,res)=>{
    let form_update = new formidable.IncomingForm(); //创建上传表单
    let imageType = -1;
    let params = null;
    let timeCount = null;
    form_update.encoding = 'utf-8'; //设置编码格式
    form_update.uploadDir = 'public/images'; //文件上传，设置临时上传目录
    form_update.keepExtensions = true; //保留后缀
    form_update.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    form_update.parse(req)
        .on ('fileBegin', function(name, file){
            file.path = form_update.uploadDir  + "/poster" + "/" + getNowFormatDate()+".jpg";
        })
        .on('file', async (name, file) => {
            params  = "/" +file.path;
            const time = new Date();
            timeCount = time.getTime();
        })
        .on('field', (fieldName, fieldValue) => {
            console.log(fieldName + ':' + fieldValue);
            imageType = parseInt(fieldValue);
        })
        .on('end', async () => {
            try {
                resource = await Resource.create({resource_type_id: imageType, resource_url: params,resource_uploaded_time: timeCount});
                // const resourceId = Resource.findOne({where: })
                generalResBody.data.imageId = resource.null;
                generalResBody.data.url = resource.resource_url;
                return res.status(200).json(generalResBody);
            } catch (error) {
                errorRes(res, '将trailer 的 poster记录保存进数据库的时候出现错误')
            }
        })
});
module.exports = router;
