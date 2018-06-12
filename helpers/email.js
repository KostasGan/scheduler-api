const nodemailer = require('nodemailer');

exports.send_Email = (config, email_list) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '',
            pass: ''
        }
    });

    let mailOptions = {
        from: 'kostas.efood@gmail.com',
        to: email_list,
        subject: 'Invitation to Event-Scheduler',
        html: "An invitation for a new event schedule sent from X. We need permission to continue the process. Login <a href='localhost:8000/login.html'> here </a> " 
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}