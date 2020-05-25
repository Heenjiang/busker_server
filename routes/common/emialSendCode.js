const nodemailer = require('nodemailer');

const emailSender = (content, toAddress) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'heenjiang1314@gmail.com',
          pass: 'Hoen520Nicole' // naturally, replace both with your real credentials or an application-specific password
        }
      });
      
      const mailOptions = {
        from: 'busker@busker.com',
        to: toAddress,
        subject: 'Captcha code from The Busker Project',
        text: content
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = emailSender;