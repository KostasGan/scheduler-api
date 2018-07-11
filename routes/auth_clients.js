const auth = require('../helpers/oauth');

exports.registerRoutes = function (app, config) {
    app.post('/api/user/auth', (req, res) => {
        let access_token = res.locals.access_token;

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