const Promise = require('bluebird');
const data_helper = require('../helpers/data');
const date_helper = require('../helpers/date');
const join = Promise.join;

exports.accessTokenValidation = (req, res, next) => {
    let access_token = req.get('X-Access-Token') ? req.get('X-Access-Token').trim() : '';

    if (access_token === '' || access_token.length < 130) {
        res.json({
            status: 'error',
            message: 'Bad Request. Wrong Access Token. Please try to login again!'
        });
        return;
    }

    res.locals.access_token = access_token;
    next();
}

exports.formDataValidation = (req, res, next) => {
    let body = req.body;
    let startDate = body.event_start ? date_helper.initDateWithTimezone(body.event_start) : '';
    let endDate = body.event_end ? date_helper.initDateWithTimezone(body.event_end) : '';
    let duration = parseInt(body.event_duration, 10) || 60;
    let available_time = body.available_time ? body.available_time.split(',') : '';
    let attendees = body.attendees || '';

    if (startDate === '' || endDate === '' || attendees === '') {
        res.json({
            status: 'error',
            message: 'Bad Request. Some variables missing. Please try again!'
        });
        return;
    };

    let diffDate = endDate.diff(startDate, 'day');

    if (available_time.length <= diffDate) {
        res.json({
            status: 'error',
            message: 'Available Time is less than Event Date range.  Try again!'
        });
        return;
    }

    join(data_helper.checkAvailableTime(available_time), data_helper.checkValidEmails(attendees), (wrong_times, wrong_emails) => {
        if (wrong_times > 0) {
            res.json({
                status: 'error',
                message: 'Invalid Available Time. Try again!'
            });
            return;
        } else if (wrong_emails > 0) {
            res.json({
                status: 'error',
                message: 'Invalid Attendees emails. Try again!'
            });
            return;
        } else {
            res.locals.data = {
                'event_start': startDate,
                'event_end': endDate,
                'diffDate': diffDate,
                'event_duration': duration,
                'available_time': available_time,
                'attendees': attendees
            }
            next();
        }
    });
}