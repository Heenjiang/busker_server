const express = require("express");
const router = express.Router();
const fs =require('fs');
const formidable = require('formidable');
const errorRes = require('../middware/errorResponse');
const units = require('../common/units');
const getNowFormatDate = units.getNowFormatDate;
const Resource = require('../models/resource');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const moveFile = require('../common/moveFile');

router.post('/', async (req, res, next) => {
    let form_update = new formidable.IncomingForm(); //创建上传表单
    let imageType = -1;
    let params = null;
    let timeCount = null;
    let originalPath = '';
    let path = '/singles';
    let filePathFlag = false;
    form_update.encoding = 'utf-8'; //设置编码格式
    form_update.uploadDir = 'public/audios'; //文件上传，设置临时上传目录
    form_update.keepExtensions = true; //保留后缀
    form_update.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    form_update.parse(req)
        .on('fileBegin', async (name, file) => {
            file.path = form_update.uploadDir  + path + "/" + getNowFormatDate()+".mp3";
            originalPath =  file.path;
            console.log(originalPath);
            filePathFlag = true;
        })
        .on('file', async (name, file) => {
            while(filePathFlag === false) {await waitParameters();}
            params  =  form_update.uploadDir  + path + "/" + getNowFormatDate()+".mp3";
            const time = new Date();
            timeCount = time.getTime();
        })
        .on('end', async () => {
            while(filePathFlag === false || path === '') {await waitParameters();}
            try {
                moveFile(originalPath, params, (err) => {
                    console.log('error occured when moving file' + err);
                });
                resource = await Resource.create({resource_type_id: 8, resource_url: params,resource_uploaded_time: timeCount});
                // const resourceId = Resource.findOne({where: })
                generalResBody.data.resource_id = resource.null;
                generalResBody.data.url = resource.resource_url;
                return res.status(200).json(generalResBody);
            } catch (error) {
                return errorRes(res, '将trailer 的 poster记录保存进数据库的时候出现错误');
            }
        })
});
router.post('/delete', async (req, res, next) => {
//参数验证
const resourceId = typeof parseInt(req.body.resourceId) === "number" ? parseInt(req.body.resourceId) : -1;
    
    try {
        const resource = await Resource.findOne({where: {resource_id: resourceId, resource_status: 1}});
        if(resource === null){
            return errorRes(res, '数据库中没有该记录');
        }
        const path = resource.resource_url;
        fs.unlinkSync(path);
        await resource.destroy();
        await resource.save();
        return res.status(200).json(generalResBody);
    } catch (error) {
        console.log(error);
        return errorRes(res, '数据库操作错误');
    }

});

function waitParameters() {
    return new Promise((resolve) => {
        setTimeout(()=>{
            console.log('waitting path parameters....');
            resolve(1);
        }, 100);
      }
    )
  }

module.exports = router;