const googleAuth = require('google-auth-library');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const auth = require('../helpers/oauth');
const ev_controler = require('../controllers/event-scheduler');
const userModel = require('../models/user').Model;

function initGoogleAuth(credentials){
    let auth = new googleAuth();

    let googleOauth2Client = new auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris);
    // googleOauth2Client.credentials = {"access_token": ac_token};

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
        let friends_list = 'kostas.efood@gmail.com'
        access_token = req.body.access_token || '';

        if(access_token === ''){
            res.json({message: 'No access token. Please try again!'});
            return; 
        }

        let oauth2Client = initGoogleAuth(credentials);

        let friends = userModel.findFriendsAccessToken(friends_list);
        let main_user = userModel.findFriendsAccessToken('kostasgan@e-food.gr');

        friends.filter((friend) => {
            oauth2Client.credentials = {"access_token": friend.ac_token};

            return auth.checkAuthToken(oauth2Client).then((val) =>{
                if(val.message === "Invalid Credentials"){
                    return friend.email;
                }
                return;
            });
        }).map((friend) => {
            return friend.email;
        }).then((unAuthUsers) => {
            if(unAuthUsers.length > 0){
                res.status(401);
                res.json({
                    status: "error",
                    error_code: "unauthorized_friends",
                    message: "Some of friendList's users need Authorization",
                    data : {
                        users: unAuthUsers
                    }
                });
                return;
            }

            Promise.props({
                main_user: main_user,        
                friends: friends
            }).then((props) => {
                let list = [];
                let availability = 0;
                props.main_user.forEach((user) => {
                    list.push(user.ac_token);
                });
                props.friends.forEach((friend) => {
                    list.push(friend.ac_token);
                });
    
                Promise.all(list).each((items) => {
                    oauth2Client.credentials = {"access_token": items};
    
                    return ev_controler.GetCalendarEvents(oauth2Client).then((event) => {
                        if(event.length === 0){
                            availability++;
                        }
                        console.log(event);
                    });
                }).then(() => { console.log(availability);});
            });
        }).catch((e) => {
            console.log(e);
        });
    });

    app.post('/gauthredirect', (req, res) => {

        access_token = req.body.access_token.trim() || '';

        if(access_token === ''){
            res.json({message: 'No access token. Please try again!'});
            return;
        }
        let oauth2Client = initGoogleAuth(credentials);
        oauth2Client.credentials = {"access_token": access_token};
        auth.authorizeClient(oauth2Client).then((val) =>{
            res.json(val);
        }).catch((error) => {
            res.status(401);
            res.json(error);
        });
    });
}