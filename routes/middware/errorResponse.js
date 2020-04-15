
module.exports = (res, message) => {
    resbody = {
        "success": false,
        "data": {
            "code": 400,
            "message": "注册成功"
        }
    }
    resbody.data.message =  message;
    res.status(400).json(resbody);
    return;
}