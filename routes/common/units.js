const verifyEmail = function  verify(val) {
    var pattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var domains= ["qq.com","163.com","vip.163.com","263.net","yeah.net","sohu.com","sina.cn","sina.com","eyou.com","gmail.com","hotmail.com","42du.cn"];
    if(pattern.test(val)) {
        var domain = val.substring(val.indexOf("@")+1);
        for(var i = 0; i< domains.length; i++) {
            if(domain == domains[i]) {
                 return true;
            }
        }
    }
    return false;
}
exports.verifyEmail = verifyEmail;

const crypto = require('crypto');
const md5Hash = function hmac(data){
    let hmac = crypto.createHmac('md5','cryptoCookie');
    return hmac.update(data).digest('base64');
}
exports.md5Hash = md5Hash;

const verifyParams = function verifyParameters(username, password, userType){
    if(username && password && userType){
      if(verifyEmail(username) && Number.isInteger(userType) && (typeof password === "string")){
          if(userType === 1 || userType === 3){
            return {"isvalid":true};
          }
         else{
             return {
             "isvalid": false, "message": "参数形式不合法！只能注册busker或者general user"}
            }
      }
      else{
         return {"isvalid": false, "message": "参数形式不合法！"}
      }
    }
    else{
       return {"isvalid": false, "message": "缺少参数！"}
    }
 }
 exports.verifyParams = verifyParams;

 const addAlbumVerifyParams = function addAlbumVerify(req, res){
    let resBody = require('../common/responsJsonFormat/generalResponseBody.json');
    if(req.body.buskerId && req.body.albumName && req.body.price && req.body.imgUrl && req.body.singles){
        return true;
    }
    else{
        return false;
    }
 }
 exports.addAlbumVerifyParams = addAlbumVerifyParams;



