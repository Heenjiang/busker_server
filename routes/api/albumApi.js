const express = require('express');
const router = express.Router();
const authenticationCheckMiddware = require('../middware/generalAuthentication');
const resBody = require('../common/responsJsonFormat/generalResponseBody.json');
const paramsCheck = require('../common/units');
const Album = require('../models/album');

router.use(authenticationCheckMiddware(req, res, next));
router.post('/',(req, res, next) => {
    paramsCheck(req, res, next);
    const buskerId = Number.isInteger(req.body.buskerId)? req.body.buskerId: -1;
    const albumName = (typeof req.body.albumName === "String") ? req.body.albumName : -1;
    const albumPrice = (typeof req.body.price === "Number") ? req.body.price : -1;
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
                        next();
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
            resBody.data.message = '数据库后台错误'；
            res.status(400).json(resBody);
            return ;
        });
});

