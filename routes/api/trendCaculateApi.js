const express = require('express');
const router = express.Router();
const errorRes = require('../middware/errorResponse');
const trendResBody = require('../common/responsJsonFormat/buskerTrendResBody.json');
const Sequelize = require('sequelize');
const sequelize = require('../common/ormConfiguration');
const units = require('../common/units');
const filterInt = units.filterInt;
const Moment = require('../models/register');
const Trailer = require('../models/trailer');
const Album = require('../models/album');
const SignLog = require('../models/signInLog');
const Busker = require('../models/busker');
const Comment = require('../models/comment');

router.post('/buskertrend', async (req, res, next) => {
    //参数获取
    const buskerId = typeof filterInt(req.body.buskerId) === "number" &&
    filterInt(req.body.buskerId) !== NaN ? filterInt(req.body.buskerId) : -1;
    const days = typeof filterInt(req.body.days) === "number" &&
    filterInt(req.body.days) !== NaN ? filterInt(req.body.days) : -1;

    //参数验证
    if(buskerId === -1 || days === -1){
       return errorRes(res, '参数错误！')
    }
   
    //当前时间戳
    const timeStampForNow = new Date().getTime();
    //往前推days的时间戳
    const xDaysAgo = timeStampForNow - days * 86400000;
    const xDaysLater = timeStampForNow + days * 86400000;

    let buskerLoginFrequencyValue = 0;
    let postedMomentsFrequencyValu = 0;
    let postedTrailersFrequencyValu = 0;
    let trailerVisitsCountValue = 0;
    let momentsVisitsCountValue =  0;
    let buskerVisitsCountValue = 0;
    let buskerAlbumsCountValue = 0;
    let buskerSinglesCountValue = 0;

     try {
         /*计算busker 最近x天登录的频率，然后登录频率最高的busker权值是：10，按照比例计算指定busker的登录权值 */
         //获取过去days登录最多次的busker
         const buskerRwaQuery = 'SELECT user_id, COUNT(*) as visits ' +
         'FROM sign_in_log'  + 
        ' WHERE user_type = 1 AND signin_published_Time > ' + xDaysAgo + 
         ' GROUP BY user_id ORDER BY visits DESC;'
         const buskers = await sequelize.query(buskerRwaQuery, { type: sequelize.QueryTypes.SELECT });
         let i = 0;
         while(i < buskers.length && buskers[i].user_id !== buskerId) {i++;}
         //计算busker最近登录的频率权重值
         buskerLoginFrequencyValue =  i >= buskers.length ? 0 : buskers[i].visits * 10 / buskers[0].visits;

         /*计算最近x天moment的权值 */
         const momentRwaQuery = "SELECT BUSKER_ID, COUNT(*) as posted_moments " + 
         " FROM moments WHERE MOMENT_PUBLISHED_TIME >= " + xDaysAgo;
         " GROUP BY BUSKER_ID ORDER BY posted_moments DESC;"
         const moments = await sequelize.query(momentRwaQuery, { type: sequelize.QueryTypes.SELECT });
         i = 0;
         while(i < moments.length && moments[i].busker_id !== buskerId) {i++;}
         //计算busker最近发布moments的频率权重值
         postedMomentsFrequencyValu =  i >= moments.length ? 0 : moments[i].posted_moments * 20 / moments[0].posted_moments;

         /**计算最近xdays有表演公告的热度值 */
         const trailerRawQuery = "SELECT BUSKER_ID, COUNT(*) as posted_trailers " + 
         " FROM trailer WHERE TRAILER_PERFORMING_TIME <="  + xDaysLater + 
        "  GROUP BY BUSKER_ID ORDER BY posted_trailers DESC;"
        const trailers = await sequelize.query(trailerRawQuery, { type: sequelize.QueryTypes.SELECT });
        i = 0;
         while(i < trailers.length && trailers[i].busker_id !== buskerId) {i++;}
         //计算busker最近发布trailers的频率权重值
         postedTrailersFrequencyValu =  i >= trailers.length ? 0 : trailers[i].posted_trailers * 20 / trailers[0].posted_trailers;

         /**访问量：
          * 个人主页+moment的访问次数+trailer的访问次数
          */
        
         //trailer 的访问次数
         const trailerVisitsRawQuery = "SELECT BUSKER_ID, SUM(trailer_visits) as visits " +
         " FROM trailer WHERE TRAILER_PERFORMING_TIME <= " + xDaysLater + 
         " GROUP BY BUSKER_ID ORDER BY trailer_visits DESC;"
         const trailerVisitsCount = await sequelize.query(trailerVisitsRawQuery, { type: sequelize.QueryTypes.SELECT });
         i = 0;
         while( i < trailerVisitsCount.length && trailerVisitsCount[i].busker_id !== buskerId) {i++;}
         //计算trailer点击次数的权值
        trailerVisitsCountValue = i >= trailerVisitsCount.length ? 0 : trailerVisitsCount[i].visits * 4 / trailerVisitsCount[0].visits;
        
        //moment的访问量计算权值
        const momentVisitsRawQuery = "SELECT BUSKER_ID, SUM(moment_visits) as visits " +
        " FROM moments WHERE MOMENT_PUBLISHED_TIME >=" + xDaysAgo +
        " GROUP BY BUSKER_ID ORDER BY moment_visits DESC;"
        const momentVisitsCount = await sequelize.query(momentVisitsRawQuery, { type: sequelize.QueryTypes.SELECT });
        i = 0;
         while( i < momentVisitsCount.length && momentVisitsCount[i].busker_id !== buskerId) {i++;}
         //计算moment点击次数的权值
         momentsVisitsCountValue = i >= momentVisitsCount.length ? 0 : momentVisitsCount[i].visits * 8 / momentVisitsCount[0].visits;
         
         //busker主页被访问的次数
         const buskerVisitsCountRawQuery = "SELECT BUSKER_ID, SUM(busker_visits) as visits " +
         " FROM busker GROUP BY BUSKER_ID ORDER BY busker_visits DESC;"
         const buskerVistCounts = await sequelize.query(buskerVisitsCountRawQuery, { type: sequelize.QueryTypes.SELECT });
         i = 0;
         while( i < buskerVistCounts.length && buskerVistCounts[i].busker_id !== buskerId) {i++;}
         //计算busker点击次数的权值
         buskerVisitsCountValue = i >= buskerVistCounts.length ? 0 : buskerVistCounts[i].visits * 8 / buskerVistCounts[0].visits;


        /**评论的权值： 
         * moment的评论+专辑的评论 */
        //获取moment评论的数量权值
        // const momentCommentsRawQuery =  
        //获取album的评论个数


         /**专辑单曲的数量权值*/
         //专辑数量权值：
         const buskerAlbumsCountRawQuery = "SELECT BUSKER_ID, COUNT(*) as albums FROM albums " +  
         " GROUP BY BUSKER_ID ORDER BY ALBUM_ID DESC;"
         const buskerAlbumsCounts = await sequelize.query(buskerAlbumsCountRawQuery, { type: sequelize.QueryTypes.SELECT });
         i = 0;
         while( i < buskerAlbumsCounts.length && buskerAlbumsCounts[i].busker_id !== buskerId) {i++;}
         //计算busker点击次数的权值
         buskerAlbumsCountValue = i >= buskerAlbumsCounts.length ? 0 : buskerAlbumsCounts[i].albums * 10 / buskerAlbumsCounts[0].albums;

         //单曲数量权值：
         const buskerSinglesCountRawQuery = "SELECT BUSKER_ID, COUNT(*) as singles FROM singles " + 
            " GROUP BY BUSKER_ID ORDER BY SINGLE_ID DESC;"
         
         const buskerSinglesCounts = await sequelize.query(buskerSinglesCountRawQuery, { type: sequelize.QueryTypes.SELECT });
         i = 0;
         while( i < buskerSinglesCounts.length && buskerSinglesCounts[i].busker_id !== buskerId) {i++;}
         //计算busker点击次数的权值
         buskerSinglesCountValue = i >= buskerSinglesCounts.length ? 0 : buskerSinglesCounts[i].singles * 10 / buskerSinglesCounts[0].singles;
         
         //计算总值：0-100
         const totalValue = buskerLoginFrequencyValue + postedMomentsFrequencyValu +
        postedTrailersFrequencyValu + trailerVisitsCountValue + momentsVisitsCountValue +
        buskerVisitsCountValue + buskerAlbumsCountValue + buskerSinglesCountValue;

        trendResBody.data.buskerTrend = totalValue;
        res.status(200).json(trendResBody);
        return;
     } catch (error) {
         console.log(error);
         return errorRes(res, '数据库事务操作失败')
     }
});

module.exports = router;