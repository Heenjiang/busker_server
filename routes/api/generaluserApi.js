const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize  = require('../common/ormConfiguration');
const errorRes = require('../middware/errorResponse');
const generalResBody = require('../common/responsJsonFormat/generalResponseBody.json');
const buskerAndRegisterAuthentication = require('../middware/buskerAndRegisterAutentication');
const adminAuthentication = require('../middware/adminAuthentication');
const User = require('../models/user');

//验证是不是注册的用户登录（busker或者register）
router.use('/update',(req, res, next) => {
    buskerAndRegisterAuthentication(req, res, next);
});
//更新user表
router.post('/update', async (req, res, next) => {
    //获取参数
    const genralUserId = typeof parseInt(req.body.id)  === "number" ? parseInt(req.body.id) : -1;
    const iconUrL = typeof req.body.iconUrL === "string" ? req.body.iconUrL : -1;
    const sex = typeof parseInt(req.body.sex)  === "number" ? parseInt(req.body.sex) : -1;
    const dateBirth = typeof parseInt(req.body.dateBirth)=== "number" ? parseInt(req.body.dateBirth) : -1;
    //检查参数合法性
    if(genralUserId !== -1 && iconUrL !== -1 && sex !== -1 && dateBirth !== -1){
        //初始化数据库事务
        const transaction = await sequelize.transaction(); 
        //事务流程
        try {
            const genralUser = await User.findOne({where: {user_id: genralUserId, user_status: 1}},
                {transaction: transaction});

            if(genralUser === null){
                return errorRes(res, 'register id:' +  genralUserId + '的用户不存在');
            }
            //修改参数
            else{
                await genralUser.update({icon_path: iconUrL, date_of_birth: dateBirth, sex: sex},{transaction: transaction});
                await transaction.commit();

                return res.status(200).json(generalResBody);
            }

        } catch (error) {
            //事务回滚
            await transaction.rollback();
            console.log(error);
            return errorRes(res, '数据库错误，请检查model');
        }
    }
    //参数不合法
    else{
        return errorRes(res, '参数格式错误，请检查request的参数');
    }
});
//验证是不是管理员权限
router.use('/delete', (req, res, next) => adminAuthentication(req, res, next));
router.post('/delete', async (req, res, next) => {
    const userId = typeof parseInt(req.body.id) === "number" ? req.body.id : -1;
    if(userId === -1){
        return errorRes(res, '参数错误，请检查request参数');
    }
    //初始化数据库事务
    const transaction = await sequelize.transaction(); 
    //事务流程
    try {
        const genralUser = await User.findOne({where: {user_id: userId, user_status: 1}},
            {transaction: transaction});

        if(genralUser === null){
            return errorRes(res, 'register id:' +  userId + '的用户不存在');
        }
        //修改参数
        else{
            await genralUser.update({user_status: 2},{transaction: transaction});
            await transaction.commit();
            return res.status(200).json(generalResBody);
        }

    } catch (error) {
        //事务回滚
        await transaction.rollback();
        console.log(error);
        return errorRes(res, '数据库错误，请检查model');
    }
});
module.exports = router;