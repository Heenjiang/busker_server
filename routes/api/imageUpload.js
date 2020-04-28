const express = require("express");
const router = express.Router();
const fs =require('fs');
const formidable = require('formidable');
const errorRes = require('../middware/errorResponse');
const units = require('../common/units');
const getNowFormatDate = units.getNowFormatDate;
const Resource = require('../models/resource');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');

router.post('/upload', async (req, res, next) => {
    let form_update = new formidable.IncomingForm(); //创建上传表单
    let imageType = -1;
    let params = null;
    let timeCount = null;
    let path = null;
    let filePathFlag = false;
    form_update.encoding = 'utf-8'; //设置编码格式
    form_update.uploadDir = 'public/images'; //文件上传，设置临时上传目录
    form_update.keepExtensions = true; //保留后缀
    form_update.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    form_update.parse(req)
        .on('field', async (fieldName, fieldValue) => {
            console.log(fieldName + ':' + fieldValue);
            imageType = parseInt(fieldValue);
            switch(imageType){
                case 4:
                    path = path + '/albums';
                    break;
                case 5:
                    path = path + '/singles';
                    break;
                case 6:
                    path = path + '/moments';
                case 7:
                    path = path + '/posters';
                    break;
                default:
                    path = path + '/temporary';
                    break;
            }
        })
        .on('fileBegin', async (name, file) => {
            while(path === null) {await waitParameters();}
            file.path = form_update.uploadDir  + path + "/" + getNowFormatDate()+".jpg";
            filePathFlag = true;
        })
        .on('file', async (name, file) => {
            while(filePathFlag === false) {await waitParameters();}
            params  = "/" +file.path;
            const time = new Date();
            timeCount = time.getTime();
        })
        .on('end', async () => {
            while(filePathFlag === false) {await waitParameters();}
            try {
                resource = await Resource.create({resource_type_id: imageType, resource_url: params,resource_uploaded_time: timeCount});
                // const resourceId = Resource.findOne({where: })
                generalResBody.data.imageId = resource.null;
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
        const path = '../..' + resource.resource_url;
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