
module.exports = (res, message) => {
    resbody = {
        "success": false,
        "data": {
            "code": 400,
            "message": "请求失败"
        }
    }
    resbody.data.message =  message;
    res.status(400).json(resbody);
    return;
}