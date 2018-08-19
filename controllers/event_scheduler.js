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
                return reject(err);
            }
            
            let events = response.items || [];

            event._constructor(response.summary, events)
                .then((new_events) => {
                    return resolve(new_events);
                });
        });
    });
}

exports.searchDateAvailability = (events, range, duration) => {
    if (events.length === 0) {
        let new_date = date_helper.createSuggestedDate(range.startDate, range.endDate, duration);

        return Promise.resolve(new_date);
    } else if (events.length > 0) {
        let new_date;
        let availability = true;

        do {
            let no_available = 0;
            new_date = date_helper.createSuggestedDate(range.startDate, range.endDate, duration);

            events.forEach((event) => {
                let newDateStartisBetweenEventStart = date_helper.isBetweenTwoDates(new_date.startDate, event.startDate, event.endDate);
                let newDateEndisBetweenEventEnd = date_helper.isBetweenTwoDates(new_date.endDate, event.startDate, event.endDate);
                let EventStartIsBetweenNewDate = date_helper.isBetweenTwoDates(event.startDate, new_date.startDate, new_date.endDate);
                let EventEndIsBetweenNewDate = date_helper.isBetweenTwoDates(event.endDate, new_date.startDate, new_date.endDate);

                if (!((!newDateStartisBetweenEventStart || !newDateEndisBetweenEventEnd) && (!EventStartIsBetweenNewDate || !EventEndIsBetweenNewDate))) {
                    no_available++;
                    return;
                }
                return;
            });

            let newDateIsInRangeDates = date_helper.isBetweenTwoDates(new_date.endDate, range.startDate, range.endDate);

            if (no_available > 0 || !newDateIsInRangeDates){
                availability = false;
            } else {
                availability = true;
            }

        }
        while (!availability);

        return Promise.resolve(new_date);
    }
}