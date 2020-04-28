const express = require("express");
const router = express.Router();
const homepageJson = require('../common/json/homePage.json');

router.get('/', (req,res)=>{
    res.status(200).json(homepageJson);
});

module.exports = router;
