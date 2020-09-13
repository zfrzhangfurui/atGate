const express = require('express');
const asyncHandler = require('../middleware/async');
const router = express.Router();
const nodemailer = require('nodemailer');

router.route('/send_email').post(asyncHandler(async (req, res, next) => {
    const { title, sendTo, email, content } = req.body;
    const emailTitle = `** Email from Artabana (${title})`
    const emailContent = `
        <div>
            <p>
            This email is from :
            </p>
            </br>
            <p> ${email}</p>
            </br>
            <p>
            content:
            </p>
            <p>
            ${content}
            </p>
        </div>`


    console.log(sendTo);
    const transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: 'fb6136aed7554a',
            pass: '5d75446a424456'
        }
    });
    var mailOptions = {
        from: 'zfrzhangfurui@gmail.com',
        to: sendTo,
        subject: emailTitle,
        html: emailContent
    };


    const response = await transport.sendMail(mailOptions);
    if (response) {
        res.status(200).json({
            success: true
        })
    }
}));


module.exports = router;