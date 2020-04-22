const nodemailer = require('nodemailer');

const emailSender = (feedback) => {

    const content = 'User email address：' + feedback.sender_email_address +
                    '\nUser\'s last name: ' + feedback.sender_last_name+
                    '\nUser\'s first name:' + feedback.sender_first_name+
                    '\nfeedback content:' + feedback.feedback_content;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'heenjiang1314@gmail.com',
          pass: 'Hoen520Nicole' // naturally, replace both with your real credentials or an application-specific password
        }
      });
      
      const mailOptions = {
        from: 'busker@busker.com',
        to: '1207881522@qq.com',
        subject: 'User feedback from busker project',
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