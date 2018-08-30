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

exports.getAllUsersEvents = (oauth2Client, range, all_users) => {
    let users_events = [];

    return Promise.each(all_users, (token) => {
        oauth2Client.credentials = { 'access_token': token.ac_token };

        return exports.GetCalendarEvents(oauth2Client, range.startDate, range.endDate)
            .then((events) => {
                users_events = users_events.concat(events.events);
            });
    }).then(() => {
        return Promise.all(users_events);
    });
}

exports.searchDateAvailability = (events, range, duration) => {
    let new_date = date_helper.createSuggestedDate(range.startDate, duration);
    let newDateIsInRangeDates = date_helper.isBetweenTwoDates(new_date.endDate, range.startDate, range.endDate);

    if (!newDateIsInRangeDates) return Promise.resolve(null);
    if (events.length === 0) return Promise.resolve(new_date);

    let availability = true;

    do {
        if (!newDateIsInRangeDates) {
            availability = true;
            new_date = null;
            break;
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

        if (no_available === 0) {
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

exports.CreateNewEvent = (oauth2Client, dates, attendees) => {

    let att = attendees.split(',');
    let attendeesArray = [];

    att.forEach((attendee) => {
        attendeesArray.push({'email': attendee});
    });
    let event = {
        'summary': 'New Meeting',
        'location': 'Athens',
        'description': 'New invitation for a meeting',
        'start': {
          'dateTime': dates.startDate,
          'timeZone': 'Europe/Athens',
        },
        'end': {
          'dateTime': dates.endDate,
          'timeZone': 'Europe/Athens',
        },
        'attendees': attendeesArray
    };
    return new Promise((resolve, reject) =>{
        calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            sendNotifications: true,
            resource: event
        }, function (err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return resolve('failed');
            }
            console.log('Event created: %s', event.htmlLink);
            return resolve('success');
        });
    });
}