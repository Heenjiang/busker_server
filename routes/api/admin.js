const express = require('express');
const router = express.Router();
const errorRes = require('../middware/errorResponse');
const resJson = require('../common/responsJsonFormat/signApi.json');
const BasicUser = require('../models/user');
const setCookie = require('../middware/setCookieMiddware');
const deleteCookie = require('../middware/deleteCookie');

router.post('/signin',(req,res, next)=>{
    const username = typeof req.body.username === "string" ? req.body.username : -1;
    const password = typeof req.body.password === "string" ? req.body.password : -1;
    const userType = parseInt(req.body.usertype) === 2 ? 2 : -1;

    if(username === -1 || password === -1 || userType === -1){
          //手动删除cookie： defaultTimeLost
          deleteCookie(req, res, next);
        return errorRes(res, '参数有误！')
    }
    
    else{
        BasicUser.findOne({ where: {username: username, user_type_id: userType} })
        .then(user => {
           if(user === null){
            resJson.error.message = "用户名不存在";
            //手动删除cookie： defaultTimeLost
            deleteCookie(req, res, next);
            res.status(400).json(resJson.error);
            return ;
           }
           else{
                if(user.password === password){
                    resJson.correct.isLogged = true;
                    resJson.correct.currentUser.id = user.user_id;
                    resJson.correct.currentUser.username = user.username;
                    resJson.correct.currentUser.typeId = user.user_type_id;
                    resJson.correct.currentUser.imgUrl = user.icon_path;
                    setCookie(req, res, next, user.user_id);
                    res.status(200).json(resJson.correct);
                }
                else{
                    resJson.error.message = "密码不正确！";
                     //手动删除cookie： defaultTimeLost
                    deleteCookie(req, res, next);
                    res.status(400).json(resJson.error);
                    return ;
                }
           }
        })
    }


   
});
module.exports = router;