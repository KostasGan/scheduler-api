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
    let new_date = date_helper.createSuggestedDate(range.startDate, duration);
    let newDateIsInRangeDates = date_helper.isBetweenTwoDates(new_date.endDate, range.startDate, range.endDate);

    if (!newDateIsInRangeDates) return Promise.resolve(null);
    if (events.length === 0) return Promise.resolve(new_date);

    if (events.length > 0) {
        let availability = true;

        do {
            if (!newDateIsInRangeDates){
                availability = true;
                return;
            };

            let no_available = 0;

            events.forEach((event) => {
                let newDateStartisBetweenEventStart = date_helper.isBetweenTwoDates(new_date.startDate, event.startDate, event.endDate);
                let newDateEndisBetweenEventEnd = date_helper.isBetweenTwoDates(new_date.endDate, event.startDate, event.endDate);
                let EventStartIsBetweenNewDate = date_helper.isBetweenTwoDates(event.startDate, new_date.startDate, new_date.endDate);
                let EventEndIsBetweenNewDate = date_helper.isBetweenTwoDates(event.endDate, new_date.startDate, new_date.endDate);

                if (!((!newDateStartisBetweenEventStart || !newDateEndisBetweenEventEnd) && (!EventStartIsBetweenNewDate || !EventEndIsBetweenNewDate))) { 
                    no_available++;
                    return;
                }
            });

            if(no_available === 0){
                availability = true;
            } else {
                availability = false;
                new_date = date_helper.createSuggestedDate(new_date.endDate, duration);
                newDateIsInRangeDates = date_helper.isBetweenTwoDates(new_date.endDate, range.startDate, range.endDate);
            }
        }
        while (!availability);

        return Promise.resolve(new_date);
    }
}