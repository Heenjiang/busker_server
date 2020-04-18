const express = require("express");
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../common/ormConfiguration');
const errorRes = require('../middware/errorResponse');
const Trailer = require('../models/trailer');
const Resource = require('../models/resource');
const Busker = require('../models/busker');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const authenticationCheckMiddware = require('../middware/generalAuthentication');
const paramsVerifyMiddware = require('../middware/addTrailerParamVerify');
const trailerDetailResBody = require('../common/responsJsonFormat/trailerDetailResBody.json');
const request = require('request');
const j = request.jar();
const cookie = request.cookie('defaultTimeLost=t1cPNEuIRek8fvtp/yroug==');
const url = 'http://localhost:3001/api/trail/detail';
j.setCookie(cookie, url);

//登录验证中间件
router.use('/', (req, res, next) => authenticationCheckMiddware(req, res, next, 'busker signed!'));
//新增trailer
router.post('/add', async (req, res, next) => {
    paramsVerifyMiddware(req, res, next);

    buskerId =  req.body.buskerId;
    imageReourceId = req.body.imgUrl;
    performingTime = req.body.time;
    publishedTime = req.body.published_time;
    performAddress = req.body.address;
    description = req.body.details;
    likes = req.body.like;
    participants = req.body.buskers;

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
        errorResBody(res,'数据库事务错误');
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
    if(trailerId === -1){
       return errorRes(res, '参数错误！');
    }
    //创建事务
    const transaction = await sequelize.transaction();
    try {
        const trailer = await Trailer.findOne({where: {trailer_id: trailerId, trailer_status: 1}},{transaction: transaction});
        if(trailer === null){
            return  errorRes(res, '该记录在数据库中不存在哦');
        }        
        const imageReource = await Resource.findOne({where: {resource_id: trailer.trailer_poster, resource_status:1}},
            {transaction: transaction});
        
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
        trailerDetailResBody.data.trail.buskers = trailer.trailer_participant;
        trailerDetailResBody.data.trail.likes = trailer.trailer_likes;

        return res.status(200).json(trailerDetailResBody);
    } catch (error) {
        //事务失败需要回滚
        console.log(error);
        errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
        return await transaction.rollback();
    }
});

router.get('/trailers', async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const trailersId = await Trailer.findAll({attributes: ['trailer_id']},
         {where: {trailer_status: 1}}, {transaction: transaction});
         
         transaction.commit();
         return getAllTailers(trailersId, res);
    } catch (error) {
         //事务失败需要回滚
         console.log(error);
         errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
         return await transaction.rollback();
    }
    
});
//根据busker获取trailers
router.post('/buskerId', async (req, res, next) => {
    let buskerId = typeof req.body.buskerId === "number" ? req.body.buskerId : -1;
    if(buskerId === -1){
        return errorResBody(res, '参数错误');
    }

    const transaction = await sequelize.transaction();
    try {
        const trailersId = await Trailer.findAll({attributes: ['trailer_id']},
         {where: {trailer_status: 1, busker_id: buskerId}}, {transaction: transaction});
         
         transaction.commit();
         return getAllTailers(trailersId, res);
    } catch (error) {
         //事务失败需要回滚
         console.log(error);
         errorRes(res, '数据库事务失败，请检查控制台错误栈信息');
         return await transaction.rollback();
    }
    
});
async function getAllTailers(trailers, res){
    let allTrailersBody = require('../common/responsJsonFormat/allTrailers.json');
    let trailerList = [];
    for(let i = 0; i < trailers.length; i++){
        let trailerInfoById = await getTrailerByid(trailers[i].trailer_id);
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

function getTrailerByid(trailerId) {
    return new Promise((resolve) => {
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
