const google = require('googleapis');
const Promise = require('bluebird');
const event = require('../models/event').Model;
const date_helper = require('../helpers/date');
let calendar = google.calendar('v3');

/**
 * Get all user's events from Google Calendar API
 * @param {Object} oauth2Client 
 * @param {String} startDate 
 * @param {String} endDate 
 * @returns {Array}
 */
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

/**
 * Check events and time slots to find the available time slots
 * @param {Array} events 
 * @param {Array} timeslots 
 * @returns {Array}
 */
exports.findAvailableSlots = (events, timeslots) => {
    if (events.length > 0 && timeslots.length > 0) {
        let indexes = [];

        timeslots.forEach((slot, index) => {
            events.forEach((event) => {
                let newDateStartisBetweenEventStart = date_helper.isBetweenTwoDates(slot.startDate, event.startDate, event.endDate);
                let newDateEndisBetweenEventEnd = date_helper.isBetweenTwoDates(slot.endDate, event.startDate, event.endDate);
                let EventStartIsBetweenNewDate = date_helper.isBetweenTwoDates(event.startDate, slot.startDate, slot.endDate);
                let EventEndIsBetweenNewDate = date_helper.isBetweenTwoDates(event.endDate, slot.startDate, slot.endDate);

                if (((newDateStartisBetweenEventStart && newDateEndisBetweenEventEnd) || (EventStartIsBetweenNewDate && EventEndIsBetweenNewDate)) && indexes.indexOf(index) === -1) {
                    indexes.push(index);
                }
                return;
            });
        });

        return Promise.all(indexes).then((index) => {
            for (i = index.length; i > 0; i--) {
                timeslots.splice(index[i - 1], 1);
            }
        }).then(() => {
            return new Promise.resolve(timeslots);
        })
    } else if (events.length === 0) {
        return new Promise.resolve(timeslots);
    }
}