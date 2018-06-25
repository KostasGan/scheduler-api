const auth = require('../helpers/oauth');

exports.registerRoutes = function (app, config) {
    let access_token;

    app.post('/gauthredirect', (req, res) => {
        access_token = req.body.access_token.trim() || '';

        if (access_token === '') {
            res.json({
                status: 'error',
                message: 'Bad Request. Some variables missing. Please try again!'
            });
            return;
        }

        let oauth2Client = auth.initGoogleAuth(config);
        oauth2Client.credentials = { 'access_token': access_token };

        auth.authorizeClient(oauth2Client).then((val) => {
            res.json(val);
        }).catch((error) => {
            res.status(401);
            res.json(error);
        });
    });
}