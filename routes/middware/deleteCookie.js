const units = require('../common/units')
function setCookie(req, res, next) {
    const defaultCookie = req.cookies.defaultTimeLost;
    if(defaultCookie){
        res.cookie('defaultTimeLost','', { maxAge: 0, httpOnly: true});
    }
    next(); // <-- important!
  }
  module.exports = setCookie