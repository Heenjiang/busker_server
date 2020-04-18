const units = require('../common/units')
const resBody = require('../common/responsJsonFormat/generalResponseBody.json');
function buskerAndRegisterAuthentication(req, res, next) {

    const defaultCookie = req.cookies.defaultTimeLost;
    const busker = 'busker signed!';
    const register = 'general register signed';
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
        let authenticationFlagMd5CookieValue = units.md5Hash(busker);
        let generalUserAuthenticationFlagMd5CookieValue = units.md5Hash(register);
        let unsignedFlagMd5CookieValue = units.md5Hash(unsignedFlag);
        switch(defaultCookie){
            case authenticationFlagMd5CookieValue:
                next();
                break;
            case generalUserAuthenticationFlagMd5CookieValue:
                next();
                break;
            case unsignedFlagMd5CookieValue:
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '权限拒绝，请先登录！'
                res.status(400).json(resBody);
                return;
            default:
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '权限拒绝，请先登录！'
                res.status(400).json(resBody);

        }
    } 
  }
  module.exports = buskerAndRegisterAuthentication;