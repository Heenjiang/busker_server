const units = require('../common/units')
function setCookie(req, res, next) {
    const defaultCookie = req.cookies.defaultTimeLost;
    if(defaultCookie){
        res.cookie('defaultTimeLost','', { maxAge: 86400000 * 10, httpOnly: true});
    }
    next(); // <-- important!
  }
  module.exports = setCookie