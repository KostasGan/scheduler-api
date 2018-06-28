const auth = require('../helpers/oauth');

exports.registerRoutes = function (app, config) {
    let access_token;

    app.post('/api/user/auth', (req, res) => {
        access_token = req.body.access_token ? req.body.access_token.trim() : '';

        if (access_token === '') {
            res.json({
                status: 'error',
                message: 'Bad Request. Some variables missing. Please try again!'
            });
            return;
        }

        let oauth2Client = auth.initGoogleAuth(config);
        oauth2Client.credentials = { 'access_token': access_token };

        auth.authorizeClient(oauth2Client).then(() => {
            res.status(200);
            res.json({
                status: 'success',
                message: 'User is valid.'
            });
            return;
        }).catch(() => {
            res.status(400);
            res.json({
                status: 'error',
                message: 'Bad Request. Please try again!'
            });
            return;
        });
    });
}