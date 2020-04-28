const express = require('express');
const router =express.Router();
const addApiParamsVerifyMiddware = require('../middware//feedbackAddApiParamsVerify');
const Feedback = require('../models/feedback');
const sequelize = require("../common/ormConfiguration");
const errRes = require('../middware/errorResponse');
const emailSender = require('../common/emailSender');
const generalResbody = require('../common/json/success.json');
const feedbackJsonObject = require('../common/json/feedbackDetail.json');
const feedbacksRes = require('../common/json/feedbacksRes.json');
const request = require('request');

router.use('/add', addApiParamsVerifyMiddware);
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



});
router.post('/status', async (req, res, next) =>{
    //参数验证
    const feedbackId = typeof req.body.feedbackId === "number" ? req.body.feedbackId : -1;
    const status = typeof req.body.status === "number" ? req.body.status : -1;
    if(feedbackId === -1 || status === -1){
        errRes(res, '参数错误');
    }
    else{
        try {
            const transaction = await sequelize.transaction();
            const feedback = await Feedback.findOne({where: {feedback_id: feedbackId}}, {transaction: transaction});
            if(feedback === null){
                return errRes(res, '数据库中没有该条记录');
            }
            await feedback.update({feedback_status: status}, {transaction: transaction});
            await feedback.save({transaction: transaction});
            await transaction.commit();
            
            return  res.status(200).json(generalResbody);
        } catch (error) {
            console.log(error);
            errRes(res, '数据库操作错误，请检查控制台错误信息');
            return;
        }
    }
});
router.post('/delete', async (req, res, next) => {
      //参数验证
      const feedbackId = typeof req.body.feedbackId === "number" ? req.body.feedbackId : -1;
     
      if(feedbackId === -1){
          errRes(res, '参数错误');
      }
      else{
          try {
              const transaction = await sequelize.transaction();
              const feedback = await Feedback.findOne({where: {feedback_id: feedbackId}}, {transaction: transaction});
              if(feedback === null){
                  return errRes(res, '数据库中没有该条记录');
              }
              await feedback.destroy({transaction: transaction});
              await transaction.commit();
              
              return  res.status(200).json(generalResbody);
          } catch (error) {
              console.log(error);
              errRes(res, '数据库操作错误，请检查控制台错误信息');
              return;
          }
      }
});
router.post('/detail', async (req, res, next) => {
    //参数验证
    const feedbackId = typeof parseInt(req.body.feedbackId) === "number" ? parseInt(req.body.feedbackId) : -1;
     
    if(feedbackId === -1){
        errRes(res, '参数错误');
    }
    else{
        try {
            const transaction = await sequelize.transaction();
            const feedback = await Feedback.findOne({where: {feedback_id: feedbackId}}, {transaction: transaction});
            await transaction.commit();
            if(feedback === null){
                return errRes(res, '数据库中没有该条记录');
            }

            const feedbackJson = feedback.toJSON();
            feedbackJsonObject.data.feedback.feedbackId = feedbackJson.feedback_id;
            feedbackJsonObject.data.feedback.status = feedbackJson.feedback_status;
            feedbackJsonObject.data.feedback.firstName = feedbackJson.sender_first_name;
            feedbackJsonObject.data.feedback.lastName = feedbackJson.sender_last_name;
            feedbackJsonObject.data.feedback.publishTime = feedbackJson.feedback_published_time;
            feedbackJsonObject.data.feedback.email = feedbackJson.sender_email_address;
            feedbackJsonObject.data.feedback.content = feedbackJson.feedback_content;
            return  res.status(200).json(feedbackJsonObject);
        } catch (error) {
            console.log(error);
            errRes(res, '数据库操作错误，请检查控制台错误信息');
            return;
        }
    }
});
router.get('/feedbacks', async (req, res, next) => {
    let cookieValue = req.cookies.defaultTimeLost === undefined ? -1 : req.cookies.defaultTimeLost;
    try {
            const feedbacks = await Feedback.findAll();
            let feedbacksDetails = [];
            for(let i = 0; i < feedbacks.length; i++){
                const feedbackDetail = await  getFeedbackByid(feedbacks[i].feedback_id, cookieValue);
                if(feedbackDetail.code === 200){
                    feedbacksDetails.push(feedbackDetail.data)
                }
                else{
                    return errRes(res, feedbackDetail.data);
                }
                feedbacksRes.data.feedbacks = feedbacksDetails;
                return res.status(200).json(feedbacksRes);
        }
    } catch (error) {
            console.log(error);
            errRes(res, '数据库操作错误，请检查控制台错误信息');
            return;
    }

});

function getFeedbackByid(feedbackId, cookieValue) {
    return new Promise((resolve) => {
        const j = request.jar();
        const cookie = request.cookie('defaultTimeLost=' + cookieValue);
        const url = 'http://localhost:3001/api/feedback/detail';
        j.setCookie(cookie, url);
        request.post({url: url, jar: j, form: {feedbackId: parseInt(feedbackId)}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.feedback});
            }
            if(response.statusCode === 400){

                resolve({code: 400, data: bodyJson.data.message});
            }
            if(error){
                resolve({code: -1, data: '请求转发错误'});
            }
        });
      }
    )
  }
  
module.exports = router;
