const google = require('googleapis');
const Promise = require('bluebird');
const moment = require('moment');

let calendar = google.calendar('v3');

exports.GetCalendarEvents = (oauth2Client) => {
    return new Promise((resolve, reject) =>{
        calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            timeMin: (new Date(2018,02,01,10)).toISOString(),
            timeMax: (new Date(2018,02,28,18)).toISOString(),
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime'
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err.message);
                return reject({
                    "status": "error",
                    "message": err.message
                });
            }

            let events = response.items || [];

            if (events.length == 0) {
                return resolve([]);
            } else {
                return new Promise.map(events, (event) => {
                    return {
                        event_id: event.id,
                        summary: event.summary,
                        startDate: new Date(event.start.dateTime),
                        startHour: new Date(event.start.dateTime).getHours(),
                        endDate: new Date(event.end.dateTime),
                        endHour: new Date(event.end.dateTime).getHours()
                    };
                }).then((new_events) => {
                    return resolve(new_events);
                });
            }
        });
    });
}