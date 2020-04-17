const units = require('../common/units')
const resBody = require('../common/responsJsonFormat/generalResponseBody.json');
function generalAuthentication(req, res, next, authenticationFlag) {

    const defaultCookie = req.cookies.defaultTimeLost;

    console.log(req.cookies);
    if (defaultCookie === undefined) {
        resBody.success = false;
        resBody.data.code = 400;
        resBody.data.message = '权限拒绝，请先登录！'
        res.status(400).json(resBody);
        return;
    } 
    else{
        let unsignedFlag = 'not signed';
        let authenticationFlagMd5CookieValue = units.md5Hash(authenticationFlag);
        let unsignedFlagMd5CookieValue = units.md5Hash(unsignedFlag);
        switch(defaultCookie){
            case authenticationFlagMd5CookieValue:
               next();
               break;
            case unsignedFlagMd5CookieValue:
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '权限拒绝，请先登录！'
                res.status(400).json(resBody);
                return;
        }
    } 
  }
  module.exports = generalAuthentication