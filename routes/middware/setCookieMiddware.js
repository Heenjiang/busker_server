const units = require('../common/units')
function setCookie(req, res, next, userId) {
   
    const userType = req.body.usertype;
    const defaultCookie = req.cookies.defaultTimeLost;

    if (defaultCookie === undefined) {
        var tenDaysLater = new Date().getTime() / 1000 * 1000 + 86400000 * 10;
        // no: set a new cookie
        let md5CookieValue = units.md5Hash(userId.toString(2) + userType.toString(2) + tenDaysLater.toString(2));

        res.cookie('defaultTimeLost',md5CookieValue, { maxAge: 86400000 * 10, httpOnly: true});
        console.log('cookie created successfully');
    } 
    else{
        
        let tenDays = req.body.tenDaysChecked;
        console.log(tenDays);
        if(tenDays === true){
            console.log('here');
            var tenDaysLater = new Date().getTime() / 1000 * 1000 + 86400000 * 10;
            // no: set a new cookie
            let md5CookieValue = units.md5Hash(userId.toString(2) + userType.toString(2) + tenDaysLater.toString(2));
            res.cookie('defaultTimeLost',md5CookieValue, { maxAge: 86400000 * 10, httpOnly: true, secure: false, overwrite: true});
            console.log('cookie updated successfully');
        }
    } 
    next(); // <-- important!
  }
  module.exports = setCookie