const express = require("express");
const router = express.Router();
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