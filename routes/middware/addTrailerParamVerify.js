const errorRes = require('../middware/errorResponse');
module.exports = (req, res, next) => {
    typeof req.body.buskerId === 'number' ? null : errorRes(res, 'buskerId 参数不正确');
    typeof req.body.time === 'number' ? null : errorRes(res, 'time 参数不正确');
    typeof req.body.address === 'string' ? null : errorRes(res, 'address 参数不正确');
    typeof req.body.published_time === 'number' ? null : errorRes(res, 'published_time 参数不正确');
    typeof req.body.imgUrl === 'number' ? null : errorRes(res, 'buskimgUrlerId 参数不正确');
    typeof req.body.details === 'string' ? null : errorRes(res, 'details 参数不正确');
    typeof req.body.like === 'number' ? null : errorRes(res, 'like 参数不正确');
    typeof req.body.buskers === 'string' ? null : errorRes(res, 'buskers 参数不正确');
    return next();
}