const express = require('express');
const router = express.Router();
const sequelize = require("../common/ormConfiguration");
const units = require('../common/units');
const resJson = require('../common/responsJsonFormat/signApi.json');
const errorRes = require('../middware/errorResponse');
const BasicUser = require('../models/user');
const SignInLog =require('../models/signInLog');
const setCookie = require('../middware/setCookieMiddware');
const deleteCookie = require('../middware/deleteCookie');

router.post('/',async (req,res, next)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userType = req.body.usertype;

    paramsCheck = units.verifyParams(username, password, userType);
    
    if(paramsCheck.isvalid){
        BasicUser.findOne({ where: {username: username, user_type_id: userType} })
        .then(async (user) => {
           if(user === null){
            resJson.error.message = "该用户尚未注册该类型";
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
                    const transaction = await sequelize.transaction(); 
                    try {
                        const signLogRecord = await SignInLog.build({user_id: user.user_id, 
                            signin_published_time: (new Date().getTime() / 1000 * 1000), user_type: user.user_type_id}, 
                            {transacation: transaction});
                        await signLogRecord.save();
                        await transaction.commit();
                    } catch (error) {
                        console.log(error);
                        errorRes(res, '数据库事务错误，请检查控制台错误信息');
                        return await transaction.rollback();
                    }
                    setCookie(req, res, next, user.user_id);
                    return res.status(200).json(resJson.correct);
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
    else{
        resJson.error.message = paramsCheck.message;
        //手动删除cookie： defaultTimeLost
        deleteCookie(req, res, next);
        res.status(400).json(resJson.error);
        return ;
    }

   
});
module.exports = router;
