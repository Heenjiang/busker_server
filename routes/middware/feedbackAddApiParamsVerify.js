const express = require('express');
const router = express.Router();
const errRes = require('../middware/errorResponse');
router.use('/', (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const content = req.body.content;
    const publishTime = req.body.publishTime;
    if(firstName && lastName && email && content && publishTime){
        if(typeof firstName === "string" && typeof lastName === "string" && typeof content === "string" && typeof email === "string"){
            if(typeof publishTime === 'number'){
                next();
            }
            else{
                errRes(res, '参数类型错误');
            }
        }
        else{
            errRes(res, '参数类型错误');
        }
    }
    else{
        return errRes(res, '参数不齐全');
    }
})

module.exports = router;