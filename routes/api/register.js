const express = require('express');
const router = express.Router();
const setCookies = require('../middware/setCookieMiddware');
const BasciUser = require('../models/user');
const Busker = require('../models/busker');
const Register = require('../models/register');
const units = require('../common/units');
const responseBody = require('../common/responsJsonFormat/registerApiResponsebody.json');

router.post('/',(req, res, next)=>{
   const usernameFromClient = req.body.username;
   const passwordFromClient = req.body.password;
   const userType = req.body.usertype;
   const parametersCheck = units.verifyParameters(usernameFromClient, passwordFromClient, userType);

   if(parametersCheck.isvalid){
      BasciUser.findOne({ where: 
         {username: usernameFromClient, user_type_id: userType} })
      .then(user => {
         if(user){
            responseBody.success = false;
            responseBody.data.code = 400;
            responseBody.data.message = "邮箱名:" + usernameFromClient +"已经被"+ userType +"类型的注册";
            res.status(400).json(responseBody);
            return;
         }
         else{
            //creating BasicUser modle
            const basicUser = BasciUser.build({username: usernameFromClient, password: passwordFromClient, user_type_id: userType, balance: 0, registered_time: new Date().getTime(), user_status: 1});
            // you can also build, save and access the object with chaining:
            basicUser.save()
            .then(anotherTask => {
               switch(basicUser.user_type_id){
                  //busker registeration
                  case 1:
                     const busker = Busker.build({busker_id: basicUser.user_id, busker_introduction: 'This busker is lazy and has no personal introduction yet'})
                     busker.save()
                     .then(anotherTask => {
                        setCookies(req, res, next, basicUser.user_id);
                        responseBody.success = true;
                        responseBody.data.code = 200;
                        responseBody.data.message = '注册成功';
                        responseBody.data.user = basicUser;
                        setCookies(req, res, next, basicUser.user_id);
                        res.status(200).json(responseBody);
                        return;
                     })
                     .catch(error => {
                        console.log(error);
                        responseBody.success = false;
                        responseBody.data.code = 400;
                        responseBody.data.message = "在数据持久化操作时出现错误：\n" + error;
                        res.status(400).json(responseBody);
                        return;
                     });
                     break;
                  //general user registeration
                  case 2:
                     const register = Register.build({register_id: basicUser.user_id, register_signature: 'This user is lazy and has no personal signature yet'})
                     register.save()
                     .then(anotherTask => {
                        setCookies(req, res, next, basicUser.user_id);
                        responseBody.success = true;
                        responseBody.data.code = 200;
                        responseBody.data.message = '注册成功';
                        responseBody.data.user = basicUser;
                        setCookies(req, res, next, basicUser.user_id);
                        res.status(200).json(responseBody);
                        return;
                     })
                     .catch(error => {
                        console.log(error);
                        responseBody.success = false;
                        responseBody.data.code = 400;
                        responseBody.data.message = "在数据持久化操作时出现错误：\n" + error;
                        res.status(400).json(responseBody);
                        return;
                     });
                     break;
                  default:
                     break;
               }
               
            })
            .catch(error => {
               console.log(error);
               responseBody.success = false;
               responseBody.data.code = 400;
               responseBody.data.message = "在数据持久化操作时出现错误：\n" + error;
               res.status(400).json(responseBody);
               return;
            });
         }
       });
   }
   else{
      responseBody.success = false;
      responseBody.data.code = 400;
      responseBody.data.message = parametersCheck.message;
      res.status(400).json(responseBody);
      return;
   }
});

module.exports = router;
