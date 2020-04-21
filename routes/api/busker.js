const express = require("express");
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize  = require('../common/ormConfiguration');
const errorRes = require('../middware/errorResponse');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const buskerDetail = require('../common/responsJsonFormat/buskerDetail.json');
const buskerAndRegisterAuthentication = require('../middware/buskerAndRegisterAutentication');
const adminAuthentication = require('../middware/adminAuthentication');
const units = require('../common/units');
const filterInt = units.filterInt;
const allBuskersInfo = require('../common/responsJsonFormat/buskersInfo.json');
const Busker = require('../models/busker');
const User = require('../models/user');
const Trailer = require('../models/trailer');
const request = require('request');
const j = request.jar();
const con = require('../common/dbconfiguration');
const sql = require('../common/sql.json');

//用户验证
router.use('/update', (req, res, next) => buskerAndRegisterAuthentication(req, res, next));
//只供用户修改个人部分信息（不包括密码）
router.post('/update', async (req, res, next) => {
    const url = 'http://localhost:3001/api/user/update';
    const cookieValue = typeof req.cookies.defaultTimeLost === "string" ? req.cookies.defaultTimeLost : -1;
    
    //获取参数
    const buskerId = typeof req.body.buskerId === "number" ? req.body.buskerId : -1;
    const nickName = typeof req.body.nickName === "string" ? req.body.nickName : -1;
    const instruments = typeof req.body.instruments === "string" ? req.body.instruments : -1;
    const introduction = typeof req.body.introduction === "string" ? req.body.introduction : -1;
    //传递给generalUser api 的参数
    const iconUrL =  req.body.iconId;
    const sex = req.body.sex;
    const dateBirth =  req.body.dateOfBirth;

    //检查参数合法性
    if(buskerId !== -1 && nickName !== -1 && instruments !== -1 && introduction !== -1){
        //转发请求到generalUser api
        const flag = await updateGeneralInfo(buskerId, iconUrL, sex, dateBirth, cookieValue, url);
        //请求成功
        if(flag.code === 200){
            //初始化数据库事务
            const transaction = await sequelize.transaction(); 
            try {
                await Busker.update({busker_nick_name: nickName, instruments: instruments, busker_introduction: introduction}
                    ,{where: {busker_id: buskerId}}, {transaction: transaction});
                
                    await transaction.commit();

                return res.status(200).json(generalResBody);
                
            } catch (error) {
                //事务回滚
                await transaction.rollback();
                console.log(error);
                return errorRes(res, '参数格式错误，请检查request的参数');
            }
        }
        else{
            return errorRes(res, '请求转发错误：' + flag.data);
        }
    }
    else{
       return errorRes(res, '参数错误，请检查request的参数');
    }

});
//验证是否是管理员登录
router.use('/delete', (req, res, next) => adminAuthentication(req, res, next));
//删除用户（只能管理员才能删除用户）
router.post('/delete', async (req, res, next) => {
    const url = 'http://localhost:3001/api/user/delete';
    const cookieValue = typeof req.cookies.defaultTimeLost === "string" ? req.cookies.defaultTimeLost : -1;
    const buskerId = typeof req.body.buskerId === "number" ? req.body.buskerId : -1;
    //验证参数
    if(buskerId === -1){
        return errorRes(res, '参数错误');
    }
    //初始化数据库事务
    const transaction = await sequelize.transaction(); 
            try {
                const busker = await Busker.findOne({where: {busker_id: buskerId}},{transaction: transaction});
                if(busker === null){
                    return errorRes(res, '数据库中没有指定记录');
                }
                await transaction.commit();
                //转发请求
                flag = await deleteUser(buskerId, cookieValue, url);
                if(flag.code === 200){
                   return res.status(200).json(generalResBody);
                }
                else{
                   return errorRes(res, flag.data);
                }
                
            } catch (error) {
                //事务回滚
                await transaction.rollback();
                console.log(error);
                return errorRes(res, '参数格式错误，请检查request的参数');
            }
    
})
//根据buskerid获取busker的相关信息
router.post('/detail', async (req, res, next) => {
    const buskerId = typeof filterInt(req.body.buskerId) === "number" &&
    filterInt(req.body.buskerId) !== NaN ? filterInt(req.body.buskerId) : -1;
    const days = typeof filterInt(req.body.days) === "number" &&
    filterInt(req.body.days) !== NaN ? filterInt(req.body.days) : -1;

    if(buskerId === -1){
        return errorRes(res, '参数有误');
    }
    const transaction = await sequelize.transaction();

    try{
        const busker = await Busker.findOne({where: {busker_id: buskerId}},
             {transaction: transaction});
        if(busker === null){
            return errorRes(res, '数据库中没有该条记录');
        }
        //更新busker主页被访问的次数
        await busker.update({busker_visits: busker.busker_visits + 1});
        const userInfo = await User.findOne({where: {user_id: buskerId, user_status: 1}}, 
            {transaction: transaction});
        if(userInfo === null){
            return errorRes(res, '该用户状态处于不可访问');
        }

        const newestTrailerRawQuery = "SELECT TRAILER_ID, MAX(TRAILER_PERFORMING_TIME) AS time " + 
        " FROM trailer WHERE trailer.BUSKER_ID = " + buskerId;
        const newestTrailer = await sequelize.query(newestTrailerRawQuery, { type: sequelize.QueryTypes.SELECT });

        const url = "http://localhost:3001/api/calculate/buskertrend";
        const buskerTrend = await getBukserTrend(userInfo.user_id, url, days);
        
        await transaction.commit();
        //赋值
        buskerDetail.data.busker.id = userInfo.user_id;
        buskerDetail.data.busker.imgUrl = userInfo.icon_path;
        buskerDetail.data.busker.buskerName = busker.busker_nick_name;
        buskerDetail.data.busker.sex = userInfo.sex;
        buskerDetail.data.busker.age = userInfo.date_of_birth;
        buskerDetail.data.busker.instrument = busker.instruments;
        buskerDetail.data.busker.introduce = busker.busker_introduction;
        buskerDetail.data.busker.tendencyAllHot = buskerTrend.code === 200 ? buskerTrend.data.buskerTrend : -1;
        buskerDetail.data.busker.recentPerform = newestTrailer === null ? -1 : newestTrailer[0].TRAILER_ID;
        return res.status(200).json(buskerDetail);

    }catch (error) {
        //事务回滚
        await transaction.rollback();
        console.log(error);
        return errorRes(res, '数据库事务失败');
    }
});

router.get('/', async (req, res, next) => {
    const days = filterInt(req.query.days) === NaN ? -1 : filterInt(req.query.days);
    if(days === -1){
        return errorRes(res, '参数错误');
    }
    const transaction = await sequelize.transaction();

    try {
        const buskerIds = await Busker.findAll({transaction: transaction});
        
        transaction.commit();
        if(buskerIds === null){
            return errorRes(res, '没有记录');
        }
        let buskersInfo = [];
        const url = 'http://localhost:3001/api/busker/detail';
        for(let i = 0; i < buskerIds.length; i++){
            let buskerInfo = await getBukserTrend(buskerIds[i].busker_id, url, days);
            if(buskerInfo.code === 200){
                buskersInfo.push(buskerInfo.data.busker);
            }
        }
        allBuskersInfo.data.buskerList = buskersInfo;
        return res.status(200).json(allBuskersInfo);

    } catch (error) {
        console.log(error);
        return errorRes(res, '事务错误');
    }
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

function updateGeneralInfo(userId, iconUrL, sex, dateBirth, cookieValue, url) {
    return new Promise((resolve) => {
    const cookie = request.cookie('defaultTimeLost=' + cookieValue);
    j.setCookie(cookie, url);
        request.post({url: url, jar: j, form: {id: userId, iconUrL: iconUrL, sex: sex, dateBirth: dateBirth}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.message});
            }
            if(response.statusCode === 400){
                resolve({code: 400, data: bodyJson.data.message});
            }
            if(error){
                resolve({code: 400, data: '请求转发错误'});
            }
        });
      }
    )
  }

function deleteUser(userId, cookieValue, url) {
    return new Promise((resolve) => {
    const cookie = request.cookie('defaultTimeLost=' + cookieValue);
    j.setCookie(cookie, url);
        request.post({url: url, jar: j, form: {id: userId}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data});
            }
            if(response.statusCode === 400){
                resolve({code: 400, data: bodyJson.data.message});
            }
            if(error){
                resolve({code: 400, data: '请求转发错误'});
            }
        });
      }
    )
  }

function getBukserTrend(userId, url, daysParams) {
    return new Promise((resolve) => {
            request.post({url: url, form: {buskerId: userId, days: daysParams}},(error, response, body) => {
                const bodyJson = JSON.parse(body);
                if(response.statusCode === 200){
                    resolve({code: 200, data: bodyJson.data});
                }
                if(response.statusCode === 400){
                    resolve({code: 400, data: bodyJson.data.message});
                }
                if(error){
                    resolve({code: 400, data: '请求转发错误'});
                }
            });
        }
    )
}
module.exports = router;
