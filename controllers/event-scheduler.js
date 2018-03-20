const google = require('googleapis');
const Promise = require('bluebird');
const moment = require('moment');

let calendar = google.calendar('v3');
let unAuthUsers = [];

exports.GetCalendarEvents = (oauth2Client) => {
    calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date(2018,02,01,14)).toISOString(),
        timeMax: (new Date(2018,02,01, 18)).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return new Promise((resolve, reject) => { 
                reject({
                    "message": err
                });
            });
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
            return new Promise((resolve, reject) => { resolve([])});
        } else {
            new Promise.map(events, (event) => {
                return {
                    event_id: event.id,
                    summary: event.summary,
                    startDate: new Date(event.start.dateTime),
                    startHour: new Date(event.start.dateTime).getHours(),
                    endDate: new Date(event.end.dateTime),
                    endDate: new Date(event.end.dateTime).getHours()
                };
            }).then((some) =>{
                console.log(some);
            });
        }
    });
}