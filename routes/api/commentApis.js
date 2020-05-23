const express = require('express');
const request = require('request');
const router = express.Router();
const Comment = require('../models/comment');
const Register = require('../models/register');
const User = require('../models/user');
const sequelize = require('../common/ormConfiguration');
const generalRes = require('../common/responsJsonFormat/generalResponseBody.json');
const errorRes = require('../middware/errorResponse');
const commentRes = require('../common/responsJsonFormat/commentRes.json');
const commentsRes = require('../common/responsJsonFormat/commentsRes.json')

router.post('/add', async (req, res, next)=>{
    const userId = req.body.userId;
    const objectId = req.body.objectId;
    const typeId = req.body.typeId;
    const content = req.body.content;
    const star = req.body.star;
    const publishTime = req.body.publishTime;

    const transaction = await sequelize.transaction();
    try {
        const comment = await Comment.build({user_id: userId, object_id: objectId, comment_type_id: typeId,
            comment_content:content, comment_star_count:star, 
            comment_published_time:publishTime},{transaction:transaction});
        await comment.save({transaction:transaction});
        await transaction.commit();
        res.status(200).json(generalRes);
    } catch (error) {
       await transaction.rollback();
       return errorRes(res, "数据库操作错误"+error);
    }
});
router.post('/subAdd', async (req, res, next)=>{
    const userId = req.body.userId;
    const objectId = req.body.objectId;
    const typeId = req.body.typeId;
    const content = req.body.content;
    const parentId = req.body.parentId;
    const publishTime = req.body.publishTime;

    const transaction = await sequelize.transaction();
    try {
        const comment = await Comment.build({user_id: userId, object_id: objectId, comment_type_id: typeId,
            comment_content:content, comment_parent_id:parentId, 
            comment_published_time:publishTime},{transaction:transaction});
        const parentComment = await Comment.findOne({where:{comment_id: parentId}}, {transaction: transaction});
        if(parentComment !== null){
            parentComment.comment_replies_count = parentComment.comment_replies_count+1;
            await parentComment.save();
        }
        
        await comment.save({transaction:transaction});
        await transaction.commit();
        res.status(200).json(generalRes);
    } catch (error) {
       await transaction.rollback();
       return errorRes(res, "数据库操作错误"+error);
    }
});
router.post('/details', async (req, res, next)=>{
    const commentId = parseInt(req.body.commentId);
    if(commentId === undefined || isNaN(commentId) || typeof commentId !== "number"){
        return errorRes(res, "参数不正确");
    }
    const comment = await Comment.findOne({where:{comment_id: commentId}});
    const register = await Register.findOne({where:{register_id: comment.user_id}});
    const user = await User.findOne({where:{user_id: comment.user_id}});
    if(comment == null){
        return errorRes(res, "没有该评论");
    }
    commentRes.success = true;
    commentRes.data.code = 200;
    commentRes.data.comment.commentId = comment.comment_id;
    commentRes.data.comment.userId = comment.user_id;
    commentRes.data.comment.userName = register.register_nick_name;
    commentRes.data.comment.imgUrl = user.icon_path;
    commentRes.data.comment.content = comment.comment_content;
    commentRes.data.comment.star = comment.comment_star_count;
    commentRes.data.comment.publishTime = comment.comment_published_time;
    commentRes.data.comment.hasReplies = comment.comment_replies_count;
    res.status(200).json(commentRes);
    return;
});
router.post('/sub', async (req, res, next)=>{
    const commentId = req.body.commentId;
    let commentsList = [];
    comments = await Comment.findAll({where:{comment_parent_id: commentId,comment_status: 1}});
    for(let i = 0; i < comments.length; i++){
        let commentInfoById = await getCommentById(comments[i].comment_id);
        if(commentInfoById.code === 400){
            return errorRes(res, commentInfoById.data);
        }
        else{
            commentsList.push(commentInfoById.data);
        }
        
    }
    commentsRes.data.subcomments = commentsList;
    return res.status(200).json(commentsRes);
});
function getCommentById(commentId) {
    return new Promise((resolve) => {
        const url = 'http://localhost:3001/api/comment/details';
        request.post({url: url, form: {commentId: parseInt(commentId)}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.comment});
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