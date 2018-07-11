const google = require('googleapis');
const Promise = require('bluebird');
const event = require('../models/event').Model;
const date_helper = require('../helpers/date');

let calendar = google.calendar('v3');

exports.GetCalendarEvents = (oauth2Client, startDate, endDate) => {
    return new Promise((resolve, reject) => {
        calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            timeMin: startDate,
            timeMax: endDate,
            singleEvents: true,
            orderBy: 'startTime'
        }, function (err, response) {
            if (err) {
                // console.log('The API returned an error: ' + err.message);
                return reject({
                    'status': 'error',
                    'message': err.message
                });
            }
            let events = response.items || [];

            event._constructor(response.summary, events).then((new_events) => {
                return resolve(new_events);
            });
        });
    });
}

exports.searchDateAvailability = (events, range) => {
    if (events.length === 0) {
        return Promise.resolve([]);
    }
    else if (events.length > 0) {
        return Promise.map(events, (event) => {
            console.log(event);
            console.log(range);
            let isBetweenStartDate = date_helper.isBetwennTwoDates(event.startDate, range.startDate, range.endDate);
            let isBetweenEndDate = date_helper.isBetwennTwoDates(event.endDate, range.startDate, range.endDate);

            if (isBetweenStartDate && isBetweenEndDate) {
                return date_helper.formatUnavailableDates(event.startDate, event.endDate);
            }
            else {
                return date_helper.formatUnavailableDates(range.startDate, range.endDate);
            }
        });
    }
}