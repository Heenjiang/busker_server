const fs = require('fs');
const express = require('express');
const multer  = require('multer');
const formidable = require('formidable');
const router = express.Router();
const upload = multer({ dest: '././public/images' });
const regJson = '{"trail_id":"", "busker_id": "", }';
var typeImage = 1;//1 默认是icon， 2 是poster， 3 是moments中的图片
//获取时间
function getNowFormatDate() {
    let date = new Date();
    let seperator1 = "-";
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate + seperator1 + date.getHours() + seperator1 + date.getMinutes() + seperator1 + date.getSeconds() +seperator1 + date.getMilliseconds();
    return currentdate.toString();
}
// 单图上传
router.post('/uploadSingleImage', upload.single('homepageImage'), function(req, res, next){
    fs.rename(req.file.path, "public/images/poster/" + req.file.fieldname+".jpg", function(err) {
        if (err) {
            throw err;
        }
        console.log('上传成功!');
    })
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify(req.file)+JSON.stringify(req.body));
});

router.get('/', function(req, res, next){
    var form = fs.readFileSync('././views/layouts/form.html', {encoding: 'utf8'});
    res.send(form);
});
router.get('/uploadImageAndJson', function(req, res, next){
    var form = fs.readFileSync('././views/layouts/uploadImageAndJson.html', {encoding: 'utf8'});
    res.send(form);
});

router.post('/update',(req,res)=>{
    let form_update = new formidable.IncomingForm(); //创建上传表单
    form_update.encoding = 'utf-8'; //设置编码格式
    form_update.uploadDir = 'public/images'; //文件上传，设置临时上传目录
    form_update.keepExtensions = true; //保留后缀
    form_update.maxFieldsSize = 20 * 1024 * 1024;   //文件大小 k
    form_update.parse(req)
        .on('field', (name, field) => {
            console.log('Field', name, field);
            typeImage = field;
            console.log({"typeImage:":typeImage});
        })
        .on ('fileBegin', function(name, file){
            //rename the incoming file to the file's name
            console.log({"typeImage:":typeImage});
            switch (typeImage) {
                case '1':
                    file.path = form_update.uploadDir + "/" + "/icon" + "/" + getNowFormatDate()+".jpg";
                    break;
                case '2':
                    file.path = form_update.uploadDir + "/" + "/poster" + "/" + getNowFormatDate()+".jpg";
                    break;
                case '3':
                    file.path = form_update.uploadDir + "/" + "/moments" + "/" + getNowFormatDate()+".jpg";
                    break;
            }
        })
        .on('file', (name, file) => {
            res.status(200).json({"path": file.path});
        })
        .on('end', () => {
            res.end()
        });
});

module.exports = router;
