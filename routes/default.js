const googleAuth = require('google-auth-library');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const auth = require('../helpers/oauth');
const ev_controler = require('../controllers/event-scheduler');
const userModel = require('../models/user').Model;
const moment = require('moment');


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
        let startDate = req.body.startDate || '2018-03-01 10:00';
        let endDate = req.body.endDate || '2018-03-01 11:00';
        // let availableTime = req.body.availableTime || '';
        // let friends_list = req.body.friends_list || '';
        let friends_list = 'kostasgan@e-food.gr'
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
    
                    return ev_controler.GetCalendarEvents(oauth2Client, startDate, endDate).then((events) => {
                        if(events.length === 0){
                            availability++;
                        }
                        else{
                            let currentStartHour = moment(startDate).hours();
                            let currentEndHour = moment(endDate).hours();

                            Promise.each(events, (event) => {
                                let checkStartHours = (currentStartHour+1 < event.startHour || currentStartHour+1 > event.startHour);
                                let checkStartEndHours = (currentStartHour+1 < event.endHour || currentStartHour-1 > event.endHour);
                                let checkEndStartHours =  (currentEndHour+1 < event.startHour || currentEndHour-1 < event.startHour);
                                let checkEndEndHours =  (currentEndHour+1 < event.endHour || currentEndHour-1 < event.endHour);
                                
                                if(checkStartHours && checkStartEndHours){
                                    if(checkEndStartHours && checkEndEndHours){
                                        console.log('oysao');
                                        availability++;
                                    }
                                }
                            });
                        }
                        console.log(events);
                    });
                }).then(() => { 
                    if(availability === list.length){
                        res.json({
                            message: 'Available Date'
                        });
                    }
                    else{
                        res.json({
                            message: 'Unavailable Date'
                        });
                    }
                    console.log(availability);
                });
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