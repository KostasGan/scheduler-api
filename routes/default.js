const googleAuth = require('google-auth-library');
const bodyParser = require('body-parser');
const auth = require('../helpers/oauth');
const ev_controler = require('../controllers/event-scheduler');

function initGoogleAuth(credentials, ac_token){
    let auth = new googleAuth();

    let googleOauth2Client = new auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris);
    googleOauth2Client.credentials = {"access_token": ac_token};

    return googleOauth2Client;
}

exports.registerRoutes = function(app, config) {
    let access_token;
    let credentials = config.get('web');
    
    app.post('/', (req, res) => {
        // let startDate = req.body.startDate || '';
        // let endDate = req.body.endDate || '';
        // let availableTime = req.body.availableTime || '';
        // let friends_list = req.body.friends_list || '';

        access_token = req.body.access_token.trim() || '';
        
        if(access_token === ''){
            res.json({message: 'No access token. Please try again!'});
            return; 
        }
        let oauth2Client = initGoogleAuth(credentials, access_token);
        ev_controler.GetCalendarEvents(oauth2Client).then((val) =>{
            res.json(val);
        });
    });

    app.post('/gauthredirect', (req, res) => {

        access_token = req.body.access_token.trim() || '';

        if(access_token === ''){
            res.json({message: 'No access token. Please try again!'});
            return;
        }
        let oauth2Client = initGoogleAuth(credentials, access_token);
        auth.authorizeClient(oauth2Client).then((val) =>{
            res.json(val);
        });
    });
}