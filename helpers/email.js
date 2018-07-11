const Promise = require('bluebird');
const nodemailer = require('nodemailer');

exports.send_Email = (config, email_list) => {
    let username = config.get('email.username');
    let password = config.get('email.password');
    let page_url = config.get('page_url');

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        port: 465,
        auth: {
            user: username,
            pass: password
        }
    });

    let mailOptions = {
        from: username,
        to: email_list,
        subject: 'Invitation to Event-Scheduler',
        html: '<p> An invitation for a new event schedule sent. We need permission to continue the process. </p><p>To continue, login <a href="' + page_url + '/login.html">here</a></p>'
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return resolve('failed');
            } else {
                console.log('Email sent: ' + info.response);
                return resolve('success');
            }
        });
    });
}