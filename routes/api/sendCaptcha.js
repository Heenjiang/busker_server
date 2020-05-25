const express = require('express');
const router = express.Router();
const emailSender = require('../common/emialSendCode');

router.post('/', async (req, res, next)=>{
    const email = req.body.email;
    const numbers = Math.floor(Math.random()*(9999-1000))+1000;
    const message = 'Hello there, we are from The Busker Project, now your are register in our sysytem,' +
    ' and now is the fianl step, please input this captha code in the register process:' + numbers;
    emailSender(message, email);
    let resBody = {
        "success": true,
        "data": {
            "code": 200,
            "captcha": ''
        }
        }
    resBody.data.captcha = numbers.toString();
    return res.status(200).json(resBody);
});

module.exports = router;