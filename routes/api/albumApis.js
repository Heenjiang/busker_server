const Sequelize = require('sequelize');
const express = require('express');
const router = express.Router();
const authenticationCheckMiddware = require('../middware/generalAuthentication');
const resBody = require('../common/responsJsonFormat/generalResponseBody.json');
const resBodyWithDetail = require('../common/responsJsonFormat/albumDetailResBody.json');
const paramsCheck = require('../common/units');
const errorResponse = require('../middware/errorResponse');
const albumsResBody = require('../common/responsJsonFormat/albumsResBody.json');
const albumCommentsResBody = require('../common/responsJsonFormat/albumCommentsResBody.json');
const Album = require('../models/album');
const Busker = require('../models/busker');
const Resource = require('../models/resource');
const Comment = require('../models/comment');
const Register = require('../models/register');

router.use('/',(req, res, next) => {
    authenticationCheckMiddware(req, res, next, 'busker signed!');
});
router.post('/add',(req, res) => {
    if(paramsCheck.addAlbumVerifyParams(req, res) === false){
        resBody.success = false;
        resBody.data.code = 400;
        resBody.data.message = '缺少必要参数';
        res.status(400).json(resBody);
        return ;
    }
    const buskerId = Number.isInteger(req.body.buskerId)? req.body.buskerId: -1;
    const albumName = (typeof req.body.albumName === "string") ? req.body.albumName : -1;
    console.log(typeof req.body.albumName);
    const albumPrice = (typeof req.body.price === "number") ? req.body.price : -1;
    //optional parameters
    const albumAuthor = req.body.author === undefined ? '暂无作者信息' : req.body.author;
    const albumSingles = req.body.singles === undefined ? 0 : req.body.singles;
    const albumSales = 0;
    const albumScore = 0;
    const albumDescription = req.body.describe === undefined ? '暂无描述' : req.body.describe;
    const albumPublishedTime = req.body.publishTime === undefined ? new Date().getTime : req.body.publishTime;

    Album.findOne({where: {busker_id: buskerId, album_name: albumName}})
        .then(album => {
            //album already exsits
            if(album){
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '该专辑已经创建';
                res.status(400).json(resBody);
                return ;
            }
            else{
                const album = Album.build({busker_id: buskerId, album_name: albumName, album_description:albumDescription,
                    album_price: albumPrice, album_sales: albumSales, album_score: albumScore, album_published_time: albumPublishedTime,
                    album_single_number: albumSingles, album_author: albumAuthor});

                    album.save()
                    .then(anotherTask => {
                        resBody.success = true;
                        resBody.data.code = 200;
                        resBody.data.message = '新增成功';
                        res.status(200).json(resBody);
                        return;
                    })
                    .catch(error =>{
                        console.log(error);
                        resBody.success = false;
                        resBody.data.code = 400;
                        resBody.data.message = '数据库后台错误';
                        res.status(400).json(resBody);
                        return ;
                    });
            }

        })
        .catch(error => {
            console.log(error);
            resBody.success = false;
            resBody.data.code = 400;
            resBody.data.message = '数据库后台错误';
            res.status(400).json(resBody);
            return ;
        });
});
router.post('/delete', (req, res) => {
    const deleteAlbumId = (typeof req.body.albumId === "number") ? req.body.albumId : -1;
    if(deleteAlbumId === -1){
        resBody.success = false;
        resBody.data.code = 400;
        resBody.data.message = '参数不正确';
        res.status(400).json(resBody);
        return;
    }
    else{
        Album.findOne({where: {album_id: deleteAlbumId, album_status: {[Sequelize.Op.or]: [1, 2, 3]}}})
            .then(album => {
                console.log(album);
                if(album === null){
                    resBody.success = false;
                    resBody.data.code = 400;
                    resBody.data.message = '没有该条记录';
                    res.status(400).json(resBody);
                    return;
                }
               else{
                Album.update({album_status: 4,}, {where: {album_id: deleteAlbumId, album_status: {[Sequelize.Op.or]: [1, 2, 3]}}})
                .then(anotherTask =>{
                    resBody.success = true;
                    resBody.data.code = 200;
                    resBody.data.message = '成功删除';
                    res.status(200).json(resBody);
                    return;
                })
                .catch(error => {
                    console.log(error);
                    resBody.success = false;
                    resBody.data.code = 400;
                    resBody.data.message = '数据库操作出错误';
                    res.status(400).json(resBody);
                    return;
                });
               }
            })
            .catch(error => {
                console.log(error);
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '数据库操作出错误';
                res.status(400).json(resBody);
                return;
            });
    }
});
router.post('/detail', (req, res) => {
    const deleteAlbumId = (typeof req.body.albumId === "number") ? req.body.albumId : -1;
    if(deleteAlbumId === -1){
        resBody.success = false;
        resBody.data.code = 400;
        resBody.data.message = '参数不正确';
        res.status(400).json(resBody);
        return;
    }
    else{
        Album.findOne({where: {album_id: deleteAlbumId, album_status: {[Sequelize.Op.or]: [1, 2, 3]}}})
            .then(album => {
                if(album === null){
                    resBody.success = false;
                    resBody.data.code = 400;
                    resBody.data.message = '没有该条记录';
                    res.status(400).json(resBody);
                    return;
                }
                else{
                    resBodyWithDetail.data.album.albumsId = album.album_id;
                    resBodyWithDetail.data.album.buskerId = album.busker_id;
                    Busker.findOne({where: {busker_id: album.busker_id}})
                    .then(busker => {
                        if(album === null){
                            resBody.success = false;
                            resBody.data.code = 400;
                            resBody.data.message = '没有该条记录';
                            res.status(400).json(resBody);
                            return;
                        }
                        else{
                            resBodyWithDetail.data.album.buskerName = busker.busker_nick_name;
                            resBodyWithDetail.data.album.albumsName = album.album_name;
                            resBodyWithDetail.data.album.author = busker.album_author;
                            resBodyWithDetail.data.album.price = album.album_price;
                            resBodyWithDetail.data.album.score = busker.album_score;
                            resBodyWithDetail.data.album.sales = album.album_sales;
                            Resource.findOne({where: {resource_object_id: album.album_id, resource_type_id: 4}})
                            .then(resource => {
                                if(resource === null){
                                    resBody.success = false;
                                    resBody.data.code = 400;
                                    resBody.data.message = '没有该条记录';
                                    res.status(400).json(resBody);
                                    return;
                                }
                                else{
                                    resBodyWithDetail.data.album.imgUrl = resource.resource_url;
                                    resBodyWithDetail.data.album.describe = album.album_description;
                                    resBodyWithDetail.data.album.publishTime = album.album_published_time;
                                    res.status(200).json(resBodyWithDetail);
                                    return;
                                }
                            })
                            .catch(error => {
                                console.log(error);
                                resBody.success = false;
                                resBody.data.code = 400;
                                resBody.data.message = '数据库操作出错误';
                                res.status(400).json(resBody);
                                return;
                            });
                        }

                    })
                    .catch(error => {
                         console.log(error);
                        resBody.success = false;
                        resBody.data.code = 400;
                        resBody.data.message = '数据库操作出错误';
                        res.status(400).json(resBody);
                        return;
                    });  
                }
            })
            .catch(error => {
                console.log(error);
                resBody.success = false;
                resBody.data.code = 400;
                resBody.data.message = '数据库操作出错误';
                res.status(400).json(resBody);
                return;
            });
    }
});
router.get('/albums', (req, res, next) => {
    let getAlbumsInfo = [];
    Album.findAll({where: {album_status: {[Sequelize.Op.or]: [1, 2, 3]}}}).then(albums => {
        if(albums.length !== 0){
            albums.forEach(album => {
                let albumInfo = {
                    "albumsId": 1,
                    "buskerName": "Isabelia herrera",
                    "albumsName": "After Hours",
                    "author": "The Weekend",
                    "imgUrl": "https://media.pitchfork.com/photos/5e6fcda64b101700083a93ce/1:1/w_160/After%20Hours_The%20Weeknd.jpg",
                    "publishTime": "2020-04-02 23:21:39"
                }
                albumInfo.albumsId = album.album_id;
                Busker.findOne({where: {busker_id: album.busker_id}})
                .then(busker => {
                    if(busker !== null){
                    albumInfo.buskerName = busker.busker_nick_name;
                    albumInfo.albumsName = album.album_name;
                    albumInfo.author = album.album_author;
                    Resource.findOne({where: {resource_object_id: album.album_id, resource_type_id: 4}})
                    .then(resource => {
                       if(resource !== null){
                        albumInfo.imgUrl = resource.resource_url;
                        albumInfo.publishTime = album.album_published_time;
                        getAlbumsInfo.push(albumInfo);
                        if(getAlbumsInfo.length >= albums.length){
                           albumsResBody.success = true;
                           albumsResBody.data.code = 200;
                           albumsResBody.data.albumsList = getAlbumsInfo;
                           res.status(200).json(albumsResBody);
                        }
                       }
                       else{
                        errorResponse(res, 'album id:' + album.album_id + '没有对应的reource，请检查数据的完整性');
                        return;
                    }
                    })
                    .catch(error => {
                        console.log(error);
                        errorResponse(res, '数据库错误！');
                        return;
                    });
                    }
                    else{
                        errorResponse(res, 'album id:' + album.album_id + '没有对应的busker，请检查数据的完整性');
                    }
                })
                .catch(error => {
                    console.log(error);
                    errorResponse(res, '数据库错误！');
                    return;
                });
            
            });
            
        }
        else{
            console.log(error);
            errorResponse(res, '没有符合查询条件的albums，请检查数据的完整性');
            return;
        }
       
    })
    .catch(error => {
        console.log(error);
        errorResponse(res, '数据库错误！');
        return;
    });

});
router.post('/comment', (req, res, next) => {
    const albumId = (typeof req.body.albumId === "number") ? req.body.albumId : -1;
    if(albumId === -1){
        errorResponse(res, '参数不正确');
        return;
    }
    else{
        let resComments = [];
        Comment.findAll({where: {comment_type_id: 4, object_id: albumId, comment_status: 1, comment_parent_id: 0}})
        .then(comments => {
            console.log(comments);
            if(comments.length !== 0){
                comments.forEach(comment => {
                    var resComment = {
                        "commentId": -1,
                        "userId": -1,
                        "userName": "xx",
                        "content": "xxx",
                        "star": -5,
                        "publishTime": "xxxxxx",
                        //add
                        "hasReplies": -1
                    };
                    resComment.commentId = comment.comment_id;
                    resComment.userId = comment.user_id;
                    Register.findOne({where: {register_id: comment.user_id}})
                    .then(register=> {
                        if(register !== null){
                            resComment.userName = register.register_nick_name;
                            resComment.content = comment.comment_content;
                            resComment.star = comment.comment_star_count;
                            resComment.publishTime = comment.comment_published_time;
                            resComment.hasReplies = comment.comment_replies_count;
                            resComments.push(resComment);
                            if(resComments.length >= comments.length){
                                albumCommentsResBody.success = true;
                                albumCommentsResBody.data.code = 200;
                                albumCommentsResBody.data.comment = resComments;
                                res.status(200).json(albumCommentsResBody);
                                return;
                            }
                        }
                        else{
                            errorResponse(res, 'comment id:' + comment.coment_id + '没有对应的用户，请检查数据完成性');
                            return;
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        errorResponse(res, '数据库操作错误');
                        return;
                    });
                });
            }
            else{
                errorResponse(res, '该专辑还没有评论哦');
                return;
            }
        })
        .catch(error => {
            console.log(error);
            errorResponse(res, '数据库操作错误');
            return;
        });
    }
});
router.post('/buskerId', (req, res, next) => {
    let buskerId = typeof req.body.buskerId === "number" ? req.body.buskerId : -1;
    if(buskerId === -1){
        return errorResBody(res, '参数错误');
    }

    Album.findAll({attributes: ['album_id']},{where: {album_status: {[Sequelize.Op.or]: [1, 2]}, busker_id: buskerId}})
    .then(albums=> {
        if(moments.length === 0){
            return errorResBody(res,'没有符合条件的moment记录');
        }
        else{
            return getAllMoments(albums, res);
        }
    })
    .catch(error => {
        console.log(error);
        return errorResBody(res,'数据库错误');
    });

});

async function getAllMoments(moments, res){
    let momentsList = [];
    for(let i = 0; i < moments.length; i++){
        let momentInfoById = await getAlbumsByBuskerId(moments[i].moment_id);
        if(momentInfoById.code === 400){
            return errorResBody(res, momentInfoById.data);
        }
        else{
            momentsList.push(momentInfoById.data);
        }
        
    }
    allMometnsBody.data.momentList = momentsList;
    return res.status(200).json(allMometnsBody);
}

function getAlbumsByBuskerId(momentId) {
    return new Promise((resolve) => {
        request.post({url: url, jar: j, form: {momentId: momentId}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.moment});
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