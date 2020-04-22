const express = require('express');
const router =express.Router();
const addApiParamsVerifyMiddware = require('../middware//feedbackAddApiParamsVerify');
const Feedback = require('../models/feedback');
const sequelize = require("../common/ormConfiguration");
const errRes = require('../middware/errorResponse');
const emailSender = require('../common/emailSender');
const generalResbody = require('../common/json/success.json');

router.use('/add', addApiParamsVerifyMiddware)
router.post('/add', async (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const content = req.body.content;
    const publishTime = req.body.publishTime;
 

    const transaction = await sequelize.transaction();

    try {
        const feedback = await Feedback.create({feedback_content: content, 
            sender_first_name: firstName, sender_last_name: lastName, 
            feedback_published_time: publishTime, sender_email_address: email}, {transaction: transaction});
        // console.log(feedback.toJSON());
        await transaction.commit();
        
        //发送邮件
        emailSender(feedback.toJSON());
        return res.status(200).json(generalResbody);
    } catch (error) {
        console.log(error);
        transaction.rollback();
        return errRes(res, '数据库事务错误');
    }



})


module.exports = router;
