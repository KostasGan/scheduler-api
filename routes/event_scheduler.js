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
            if (main_user && attendees) {
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

        Promise.all(all_users)
            .filter((user) => {
                oauth2Client.credentials = { 'access_token': user.ac_token };
                return auth.checkAuthToken(oauth2Client).then((val) => {
                    if (val === 'Invalid Credentials') {
                        userModel.UpdateUser(user.email, user.ac_token, true);
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
                if (!all_users || all_users.length === 0) return;

                let suggestedDates = [];
                let all_events = [];
                let dateRange = date_helper.formatDateWithTime(startDate, diffDate, available_time);

                return Promise.each(dateRange, (range) => {
                    return ev_controler.getAllUsersEvents(oauth2Client, range, all_users).then((events) => {
                        all_events = all_events.concat(events);
                    });
                }).then(() => {
                    dateRange.forEach((range) => {
                        if (suggestedDates.length > 0) return;
                        ev_controler.searchDateAvailability(all_events, range, duration)
                            .then((dt) => {
                                if (!dt) return;

                                suggestedDates = suggestedDates.concat(dt);
                            });
                    });
                }).then(() => {
                    return Promise.all(suggestedDates)
                        .then((suggestedDates) => {
                            if (!suggestedDates || suggestedDates.length === 0) return [];

                            oauth2Client.credentials = { 'access_token': access_token };
                            return ev_controler.CreateNewEvent(oauth2Client, suggestedDates[0], attendees).then((res) => {
                                if (res === 'failed') return [];

                                return suggestedDates;
                            });
                        });
                });
            })
            .then((suggested_dates) => {
                if (!suggested_dates) return;

                let suggested;
                let message = 'Δεν υπάρχουν διαθέσιμες ημερομηνίες. Δοκιμάστε ξανά με νέα στοιχεία!';
                let suggested_date = [];

                if (suggested_dates.length > 0) {
                    suggested = date_helper.formatSuggestedDates(suggested_dates[0].startDate, suggested_dates[0].endDate);
                    message = 'Event Created';
                    suggested_date.push(suggested);
                }

                res.json({
                    status: 'success',
                    message: message,
                    data: suggested_date
                });
                return;
            })
            .catch((e) => {
                console.log(e);
                res.json({
                    status: 'error',
                    message: 'Bad Request. Please try again!'
                });
                return;
            });
    });
}