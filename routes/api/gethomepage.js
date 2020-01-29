const express = require("express");
const router = express.Router();
const fs = require('fs');

router.get('/',(req,res)=>{
        const img = fs.readFileSync('././public/images/upload/homepageImage.jpg');
        res.writeHead(200, {'Content-Type': 'image/gif' });
        res.end(img, 'binary');
});

module.exports = router;
