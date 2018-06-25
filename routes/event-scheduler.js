const Promise = require('bluebird');
const auth = require('../helpers/oauth');
const date_helper = require('../helpers/date');
const data_helper = require('../helpers/data');
const ev_controler = require('../controllers/event-scheduler');
const userModel = require('../models/user').Model;
const moment = require('moment');

exports.registerRoutes = function (app, config) {
    let access_token;

    app.post('/', (req, res) => {
        let body = req.body;
        let startDate = moment(body.event_start) || moment().toISOString();
        let endDate = moment(body.event_end) || moment().add(1, 'h').toISOString();
        let duration = parseInt(body.event_duration, 10) || 1;
        let available_time = body.available_time ? body.available_time.split(',') : '';
        let attendees = body.attendees || '';
        access_token = req.get('X-Access-Token') ? req.get('X-Access-Token').trim() : '';

        let diffDate = endDate.diff(startDate, 'day');

        if (access_token === '' || startDate === '' || endDate === '' || attendees === '') {
            res.json({
                status: 'error',
                message: 'Bad Request. Some variables missing. Please try again!'
            });
            return;
        }

        if (available_time.length > diffDate) {
            data_helper.checkAvailableTime(available_time).then((val) => {
                if (val > 0) {
                    res.json({
                        status: 'error',
                        message: 'Invalid Available Time. Try again!'
                    });
                    return;
                }
            });
        } else {
            res.json({
                status: 'error',
                message: 'Available Time is less than Event Date range.  Try again!'
            });
            return;
        }

        data_helper.checkValidEmails(attendees).then((val) => {
            if (val > 0) {
                res.json({
                    status: 'error',
                    message: 'Invalid Attendees emails. Try again!'
                });
                return;
            }
        });

        let oauth2Client = auth.initGoogleAuth(config);
        let friends = userModel.findFriendsAccessToken(attendees);
        let main_user = userModel.findUserByAccessToken(access_token);

        friends.filter((friend) => {
            oauth2Client.credentials = { 'access_token': friend.ac_token };

            return auth.checkAuthToken(oauth2Client).then((val) => {
                if (val === 'Invalid Credentials') {
                    return friend.email;
                }
                return;
            });
        }).map((friend) => {
            return friend.email;
        }).then((unAuthUsers) => {
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

            Promise.props({
                main_user: main_user,
                friends: friends
            }).then((props) => {
                let users_tokens = [];
                let unavailable_dates = [];
                let dateRange = [];

                date_helper.formatDateWithTime(startDate, diffDate, available_time).then((v) => {
                    dateRange = v;
                });

                users_tokens.push(props.main_user ? props.main_user.ac_token : '');

                props.friends.forEach((friend) => {
                    users_tokens.push(friend.ac_token);
                });

                return Promise.all(users_tokens).each((token) => {
                    oauth2Client.credentials = { 'access_token': token };

                    return Promise.each(dateRange, (range) => {
                        return ev_controler.GetCalendarEvents(oauth2Client, range.startDate, range.endDate).then((events) => {
                            ev_controler.searchDateAvailability(events.events, range).then((data) => {
                                if (data.length > 0) {
                                    unavailable_dates = data;
                                }
                            });
                        })
                    })
                }).then(() => {
                    if (unavailable_dates.length === 0) {
                        res.json({
                            status: 'success',
                            message: 'Available Date',
                            data: unavailable_dates
                        });
                    } else {
                        res.json({
                            status: 'success',
                            message: 'Unavailable Date',
                            data: unavailable_dates
                        });
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