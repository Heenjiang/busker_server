const units = require('../common/units')
const resBody = require('../common/responsJsonFormat/generalResponseBody.json');
function adminAuthentication(req, res, next) {

    const defaultCookie = req.cookies.defaultTimeLost;

    console.log(req.cookies);
    if (defaultCookie === undefined) {
        resBody.success = false;
        resBody.data.code = 400;
        resBody.data.message = '权限拒绝，必须是管理员才能访问，管理员请先登录！'
        res.status(400).json(resBody);
        return;
    } 
    else{
        let unsignedFlag = 'not signed';
        let adminAuthenticationFlagMd5CookieValue = units.md5Hash('admin signed');
        let unsignedFlagMd5CookieValue = units.md5Hash(unsignedFlag);
        switch(defaultCookie){
            case adminAuthenticationFlagMd5CookieValue:
               return next();
            case unsignedFlagMd5CookieValue:
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '权限拒绝，必须是管理员才能访问，管理员请先登录！'
                res.status(400).json(resBody);
                return;
            default: 
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '权限拒绝，必须是管理员才能访问，管理员请先登录！'
                res.status(400).json(resBody);
                return;

        }
    } 
}
  module.exports = adminAuthentication