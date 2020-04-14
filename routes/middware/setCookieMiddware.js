const units = require('../common/units')
function setCookie(req, res, next, userId) {
    const userType = req.body.usertype;
    const defaultCookie = req.cookies.defaultTimeLost;
    const cookieFlag = 'not signed';
    switch(userType){
        case 1: 
            cookieFlag = 'busker signed!';
            break;
        case 2:
            cookieFlag = 'admin signed';
            break;
        case 3:
            cookieFlag = 'general register signed';
            break;
        default:
            break;
    }
    if (defaultCookie === undefined) {
        // no: set a new cookie
        let md5CookieValue = units.md5Hash(cookieFlag);
        res.cookie('defaultTimeLost',md5CookieValue, { maxAge: 86400000 * 10, httpOnly: true});
    } 
    else{
        let tenDays = req.body.tenDaysChecked;
        if(tenDays === true){
            let md5CookieValue = units.md5Hash(cookieFlag);
            res.cookie('defaultTimeLost',md5CookieValue, { maxAge: 86400000 * 10, httpOnly: true, secure: false, overwrite: true});
        }
    } 
    next(); // <-- important!
  }
  module.exports = setCookie