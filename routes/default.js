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

function checkValidEmails(attendees){
    var re = /^(([^<>()\[\]\\.:@"]+(\.[^<>()\[\]\\.:@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emails = attendees.trim().split(",");
    let wrong_emails = 0;
    return Promise.each(emails,(email) => {
        if(!re.test(String(email.trim()).toLowerCase())){
            wrong_emails++;
        }
        return;
    }).then(() => {
        return Promise.resolve(wrong_emails);
    });
}

function checkAvailableTime(available_time){
    var re = /^(?:(([01]?\d|2[0-3]):([0-5]?\d))-(([01]?\d|2[0-3]):([0-5]?\d)))$/;
    let wrong_times = 0;
    return Promise.each(available_time,(time) => {
        if(!re.test(String(time.trim()))){
            wrong_times++;
        }
        return;
    }).then(() => {
        return Promise.resolve(wrong_times);
    });
}

function formatDateWithTime(startDate, diffDate, available_time){
    let range = [];

    for(let i=0; i <= diffDate; i++){
        let av_time = available_time[i].trim().split(/[":\-"]/);
        let new_date = new moment(startDate.toISOString());

        if(av_time[i] !== "0" && av_time[i+1] !== "0"){
            range.push({
                "startDate": new_date.add(i, "d").set({'hour': av_time[0], 'minutes': av_time[1]}).toISOString(),
                "endDate": new_date.set({'hour': av_time[2], 'minutes': av_time[3]}).toISOString()
            });
        }
    }
    return Promise.all(range);
}

exports.registerRoutes = function(app, config) {
    let access_token;
    let credentials = config.get("web");
    
    app.post("/", (req, res) => {
        let body = req.body;
        let startDate = moment(body.event_start) || moment().toISOString();
        let endDate = moment(body.event_end) || moment().add(1, "h").toISOString();
        let duration = parseInt(body.event_duration, 10) || 1;
        let available_time = body.available_time.split(",") || "";
        let attendees = body.attendees || ""  ;
        access_token = req.get('X-Access-Token') || "";
        
        let diffDate = endDate.diff(startDate,"day");
        let dateRange = [];

        if(access_token === "" || startDate === "" || endDate === "" || attendees === ""){
            res.json({
                status: "error",
                message: "Bad Request. Please try again!"
            });
            return; 
        }
        
        if(available_time.length > diffDate){
            checkAvailableTime(available_time).then((val) => { 
                if (val > 0){
                    res.json({
                        status: "error",
                        message: "Invalid Available Time. Try again!"
                    });
                    return;
                }
            });
        }
        else{
            res.json({
                status: "error",
                message: "Available Time is less than Event Date range.  Try again!"
            });
            return;
        }

        checkValidEmails(attendees).then((val) => {
            if (val > 0){
                res.json({
                    status: "error",
                    message: "Invalid Attendees emails. Try again!"
                });
                return;
            }
        });

        let oauth2Client = initGoogleAuth(credentials);
        let friends = userModel.findFriendsAccessToken(attendees);
        let main_user = userModel.findUserByAccessToken(access_token);

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
                let users_tokens = [];
                let unavailable_dates = [];

                formatDateWithTime(startDate, diffDate, available_time).then((v) => {
                    dateRange = v;
                });

                props.main_user.forEach((user) => {
                    users_tokens.push(user.ac_token);
                });
                props.friends.forEach((friend) => {
                    users_tokens.push(friend.ac_token);
                });

                return Promise.all(users_tokens).each((token) => {
                    oauth2Client.credentials = {"access_token": token};

                    return Promise.each(dateRange, (range) => {
                        return ev_controler.GetCalendarEvents(oauth2Client, range.startDate, range.endDate).then((events) => {
                            ev_controler.searchDateAvailability(events, range).then((va) =>{
                                if(va.length > 0){
                                    unavailable_dates = va;
                                }
                            });
                        })
                    })
                }).then(() => {
                    // console.log(unavailable_dates);
                    if(unavailable_dates.length === 0){
                        res.json({
                            status: "success",
                            message: 'Available Date',
                            data: unavailable_dates
                        });
                    }
                    else{
                        res.json({
                            status: "success",
                            message: 'Unavailable Date',
                            data: unavailable_dates
                        });
                    }
                }).catch((e) => {
                    console.log(e);
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