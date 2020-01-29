const express = require("express");
const router = express.Router();
const homepageJson = require('../common/json/homeImgList');

router.get('/', (req,res)=>{
    res.status(200).json(homepageJson);
});

module.exports = router;
