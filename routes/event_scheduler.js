const Promise = require('bluebird');
const auth = require('../helpers/oauth');
const date_helper = require('../helpers/date');
const ev_controler = require('../controllers/event_scheduler');
const userModel = require('../models/user').Model;
const join = Promise.join;

exports.registerRoutes = function (app, config) {
    app.post('/api/events/scheduler', (req, res) => {
        let body = res.locals.data;
        let startDate = body.event_start; 
        let diffDate = body.diffDate;
        let duration = body.event_duration;
        let available_time = body.available_time;
        let attendees = body.attendees;
        let access_token = res.locals.access_token;

        let oauth2Client = auth.initGoogleAuth(config);
        let all_users = join(userModel.findUserByAccessToken(access_token), userModel.findFriendsAccessToken(attendees), (main_user, attendees) => {
            if(main_user && attendees){
                attendees.push(main_user);
                return attendees;
            }

            res.status(401);
            res.json({
                status: 'error',
                error_code: 'main_user_not_found',
                message: 'No user found with access token!',
                data: {}
            });
            return [];
        });

        Promise.all(all_users).filter((user) => {
            oauth2Client.credentials = { 'access_token': user.ac_token };
            return auth.checkAuthToken(oauth2Client).then((val) => {
                if (val === 'Invalid Credentials') {
                    return user.email;
                }
                return;
            });
        })
        .map((user) => {
            return user.email;
        })
        .then((unAuthUsers) => {
            if (unAuthUsers.length > 0) {
                res.status(401);
                res.json({
                    status: 'error',
                    error_code: 'unauthorized_friends',
                    message: 'Some of friendList`s users need Authorization',
                    data: {
                        users: unAuthUsers
                    }
                });
                return;
            }
            return all_users;
        })
        .then((all_users) => {
            if(!all_users || all_users.length === 0) return;

            let suggestedDates = [];
            let dateRange = date_helper.formatDateWithTime(startDate, diffDate, available_time);

            return Promise.each(dateRange, (range, index) => {
                return Promise.each(all_users, (token) => {
                    oauth2Client.credentials = { 'access_token': token.ac_token };

                    return ev_controler.GetCalendarEvents(oauth2Client, range.startDate, range.endDate)
                        .then((events) => {
                            return ev_controler.searchDateAvailability(events.events, range, duration);
                        })
                        .then((dt) => {
                            if (!dt) return;

                            if (suggestedDates.length === index ){
                                let suggested = date_helper.formatSuggestedDates(dt.startDate, dt.endDate);
                                suggestedDates.push(suggested);
                            }
                            
                        });
                });
            })
            .then(() => {
                return new Promise.all(suggestedDates);
            });
        })
        .then((suggested_dates) => {
            if(!suggested_dates) Promise.reject();

            if (suggested_dates.length > 0) {
                res.json({
                    status: 'success',
                    message: 'Suggested Dates',
                    data: suggested_dates
                });
                return;
            } else {
                res.json({
                    status: 'success',
                    message: 'Unavailable Dates',
                    data: suggested_dates
                });
                return;
            }
        }).catch((e) => {
            console.log(e);
            res.json({
                status: 'error',
                message: 'Bad Request. Please try again!'
            });
            return;
        });
    });
}