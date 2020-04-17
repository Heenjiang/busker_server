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
        const trailer = Trailer.build({busker_id: buskerId, trailer_participant: participants,
            trailer_performing_time:performingTime, trailer_perform_adress:performAddress,
            trailer_published_time:publishedTime, trailer_poster:resource.resource_id,
            trailer_description: description, trailer_status:1, trailer_likes: 0 }, { transaction: t });

        trailer.save({ transaction: t });
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
