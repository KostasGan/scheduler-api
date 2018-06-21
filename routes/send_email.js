const Email = require('../helpers/email');

exports.registerRoutes = function (app, config) {
    app.post('/api/send_email', (req, res) => {
        let mail_list = req.body.email_list || '';

        if (mail_list === '') {
            res.status(400);
            res.json({
                status: 'error',
                message: 'Bad Request. Please try again!'
            });
            return;
        }

        Email.send_Email(config, mail_list).then((val) => {
            if (val === 'success') {
                res.json({
                    'status': 'success',
                    'message': 'Invitation E-mail Sent Successfully'
                });
                return;
            }
            else {
                res.json({
                    'status': 'error',
                    'message': "We can't send the invitation E-mail. Try again later!"
                });
                return;
            }
        });
    });
}