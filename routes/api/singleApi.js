const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');
const Single = require('../models/single');
const Album = require('../models/album');
const Resource = require('../models/resource');
const Sequelize = require('sequelize');
const dbCon = require('../common/dbconfiguration');
const errorRes = require('../middware/errorResponse');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const singleRes = require('../common/json/singleRes.json');
const singlesRes = require('../common/json/singlesRes.json');
const request = require('request');

router.get('/', async(req, res, next)=>{
    let singleList = [];
    singles = await Single.findAll({where:{single_status: {[Sequelize.Op.or]: [1, 2]}}});
    for(let i = 0; i < singles.length; i++){
        let singlleInfoById = await getSingleById(singles[i].single_id);
        if(singlleInfoById.code === 400){
            return errorRes(res, singlleInfoById.data);
        }
        else{
            singleList.push(singlleInfoById.data);
        }
        
    }
    singlesRes.data.singles = singleList;
    return res.status(200).json(singlesRes);
});
router.post('/details', async(req, res, next)=>{
    const singleId = parseInt(req.body.singleId);
    if(singleId === undefined || typeof singleId !== "number" || isNaN(singleId)){
        errorRes(res,'参数错误');
        return;
    }

   const singleInfo = await Single.findOne({where: {single_id: singleId}});
   if(singleInfo === null){
       return res.status(200).json({"message": "数据库中没有该单曲信息"});
   }

   //装填数据
   singleRes.success = true;
   singleRes.data.code = 200;
   singleRes.data.single.singleId = singleInfo.single_id;
   singleRes.data.single.singleName = singleInfo.single_name;
   singleRes.data.single.singleLink = singleInfo.single_link;
   singleRes.data.single.singleDescription = singleInfo.single_description;
   singleRes.data.single.singleType = singleInfo.single_type;
   singleRes.data.single.singlePublishedTime = singleInfo.single_published_time;
   singleRes.data.single.singleAuthor = singleInfo.single_author;
   singleRes.data.single.singleStatus = singleInfo.single_status;
   singleRes.data.single.order = singleInfo.single_order;
   //响应请求
   res.status(200).json(singleRes);
   return;
});
router.post('/delete', async (req, res, next)=>{
    const singleId = req.body.singleId;
    const singleDelete = await Single.findOne({where:{single_id:singleId, single_status:1}});
    if(singleDelete === null){
        return errorRes(res, "没有该单曲");
    }
    await Single.update({single_status: 2},{where:{single_id: singleId}});
    return res.status(200).json(generalResBody);
});
router.post('/add', async (req, res, next)=>{
    const singleName = req.body.singleName;
    const author = req.body.author;
    const singleType = req.body.singleType;
    const order = req.body.order;
    const resourceId = req.body.resourceId;
    const url = req.body.url;
    const singlePublishedTime = req.body.singlePublishedTime;
    const albumId = req.body.albumId;
    const album = await Album.findOne({where:{album_id: albumId}});

    const singleSave = await Single.build({album_id: albumId, single_link: url, single_type:singleType,
        single_published_time: singlePublishedTime, single_author: author, single_name:singleName,
        single_order: order, busker_id: album.busker_id});
    await singleSave.save();
    const single = await Single.findOne({where:{single_order: order,album_id: albumId}});
    
    await Resource.update({resource_object_id:single.single_id},{where:{resource_id: resourceId}});
    
    return res.status(200).json(generalResBody);

});
router.get('/type', async (req, res, next)=>{
    const tags = await Tag.findAll();
    if(tags.length === 0){
        return res.status(200).json(generalResBody);
    }
    let tagsList = [];
    for (let index = 0; index < tags.length; index++) {
        const element = tags[index];
        let tag = {
            "typeId":-1,
            "typeName":''
        }
        tag.typeId = element.tag_id;
        tag.typeName = element.tag_name;
        tagsList.push(tag);
    }

    generalResBody.data.singleTypes = tagsList;
    return res.status(200).json(generalResBody);
});
function getSingleById(singleId) {
    return new Promise((resolve) => {
        const url = 'http://localhost:3001/api/single/details';
        request.post({url: url, form: {singleId: parseInt(singleId)}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.single});
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
