const express = require("express");
const router = express.Router();
const errorResBody = require('../middware/errorResponse');
const Moment = require('../models/moment');
const Resource = require('../models/resource');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const authenticationCheckMiddware = require('../middware/generalAuthentication');

router.use('/',(req, res, next) => {
    authenticationCheckMiddware(req, res, next, 'busker signed!');
});
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
    momentModelInstance = Moment.build({busker_id: buskerId, moment_published_time: postTime, 
        moment_content: content, moment_trend: momentTrend, moment_published_address: address});
    if(videos === -1 && images === -1){
        errorResBody(res, '请至少为moment添加一张图片或者一个视频');
        return;
    }
    momentModelInstance.save()
    .then(anotherTask => {
       // 向reource 表中插入moment的video数据
       if(videos !== -1 && videos.length > 0){
        for(let i = 0; i < videos.length; i++){
         videoModelInstance = Resource.build({resource_type_id: 3, 
             resource_object_id: momentModelInstance.moment_id,
             resource_url: videos[i].url, 
             resource_uploaded_time: momentModelInstance.moment_published_time})
         videoModelInstance.save()
         .then( ()=>{
             if(i == videos.length-1){
                 // 向reource 表中插入moment的image数据
                if(images !== -1 && images.length > 0){
                    for(let j = 0; j < images.length; j++){
                        imageModelInstance = Resource.build({resource_type_id: 6, 
                            resource_object_id: momentModelInstance.moment_id,
                            resource_url: images[j].url, 
                            resource_uploaded_time: momentModelInstance.moment_published_time})
                         imageModelInstance.save()
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
            }
         })
         .catch(error => {
             console.log(error);
             errorResBody(res, '数据库操作出错');
             return;
         });
  
        }
     }
    })
    .catch(error => {
        console.log(error);
        errorResBody(res, '数据库操作出错')
        return;
    });
});

module.exports = router;
