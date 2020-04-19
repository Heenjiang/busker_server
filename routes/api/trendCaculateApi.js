const express = require('express');
const router = express.Router();
const errorRes = require('../middware/errorResponse');
const Sequelize = require('sequelize');
const sequelize = require('../common/ormConfiguration');
const Moment = require('../models/register');
const Trailer = require('../models/trailer');
const Album = require('../models/album');
const SignLog = require('../models/signInLog');
const Busker = require('../models/busker');
const Comment = require('../models/comment');

router.get('/', async (req, res, next) => {
    //参数获取
    const buskerId = typeof parseInt(req.params.buskerId) === "number" &&
     parseInt(req.params.buskerId) !== isNaN ? parseInt(req.params.buskerId) : -1;
    const days = typeof parseInt(req.params.days) === "number" &&
    parseInt(req.params.days) !== isNaN ? parseInt(req.params.days) : -1;

    //参数验证
    if(buskerId === -1 || days === -1){
        errorRes(res, '参数错误！')
    }
   
    //当前时间戳
    const timeStampForNow = new Date().getTime();
    //往前推days的时间戳
    const xDaysAgo = timeStampForNow - days * 86400000;
    const xDaysLater = timeStampForNow + days * 86400000;

    let buskerLoginFrequencyValue = 0;
    let postedMomentsFrequencyValu = 0;
    let postedTrailersFrequencyValu = 0;

     //初始化数据库事务
     const transaction = await sequelize.transaction();

     try {
         /*计算busker 最近x天登录的频率，然后登录频率最高的busker权值是：10，按照比例计算指定busker的登录权值 */
         //获取过去days被访问最多次的busker
         const buskerRwaQuery = 'SELECT user_id, COUNT(*) as visits' +
         'FROM sign_in_log'  + 
        ' WHERE user_type = 1 AND signin_published_Time > ' + xDaysAgo + 
         'GROUP BY user_id ORDER BY visits DESC;'
         const buskers = await sequelize.query(buskerRwaQuery, { type: QueryTypes.SELECT });
         let i = 0;
         while(i < buskers.length && buskers[i].user_id !== buskerId) {i++;}
         //计算busker最近登录的频率权重值
         buskerLoginFrequencyValue =  i >= buskers.length ? 3 : buskers[i].visits * 10 / buskers[0].visits;

         /*计算最近x天moment的权值 */
         const momentRwaQuery = "SELECT BUSKER_ID, COUNT(*) as posted_moments " + 
         "FROM moments WHERE MOMENT_PUBLISHED_TIME >=" + xDaysAgo;
         "GROUP BY BUSKER_ID ORDER BY posted_moments DESC;"
         const moments = await sequelize.query(momentRwaQuery, { type: QueryTypes.SELECT });
         let i = 0;
         while(i < moments.length && moments[i].busker_id !== buskerId) {i++;}
         //计算busker最近发布moments的频率权重值
         postedMomentsFrequencyValu =  i >= moments.length ? 6 : moments[i].posted_moments * 20 / moments[0].posted_moments;

         /**计算最近xdays有表演公告的热度值 */
         const trailerRawQuery = "SELECT BUSKER_ID, COUNT(*) as posted_trailers " + 
         "FROM trailer WHERE TRAILER_PERFORMING_TIME <="  + xDaysLater + 
        " GROUP BY BUSKER_ID ORDER BY posted_trailers DESC;"
        const trailers = await sequelize.query(trailerRawQuery, { type: QueryTypes.SELECT });
        let i = 0;
         while(i < trailers.length && trailers[i].busker_id !== buskerId) {i++;}
         //计算busker最近发布moments的频率权重值
         postedTrailersFrequencyValu =  i >= trailers.length ? 6 : trailers[i].posted_trailers * 20 / trailers[0].posted_trailers;

         

         



     } catch (error) {
         
     }





    
});

module.exports = router;