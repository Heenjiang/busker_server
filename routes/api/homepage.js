const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const homepageJson = require('../common/json/homePage.json');
const request = require('request');
const Album = require('../models/album');
const errorRes = require('../middware/errorResponse');
router.get('/home', async (req,res, next)=>{
    console.log(homepageJson);
    let albumList = [];
    const recommendAlbums = await Album.findAll({where: {album_visits:{[Op.gte]: 10}}});
    for(let i = 0; i < recommendAlbums.length; i++){
        let albumInfoById = await getSingleById(recommendAlbums[i].album_id);
        if(albumInfoById.code === 400){
            return errorRes(res, albumInfoById.data);
        }
        else{
            albumList.push(albumInfoById.data);
        }
        
    }
    homepageJson.data.homeAlbums = albumList;
    res.status(200).json(homepageJson);
    return;
});
function getSingleById(albumId) {
    return new Promise((resolve) => {
        const url = 'http://localhost:3001/api/album/detail';
        request.post({url: url, form: {albumId: parseInt(albumId)}},(error, response, body) => {
            const bodyJson = JSON.parse(body);
            if(response.statusCode === 200){
                resolve({code: 200, data: bodyJson.data.album});
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
