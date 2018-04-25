const google = require('googleapis');
const Promise = require('bluebird');
const moment = require('moment');

let calendar = google.calendar('v3');

exports.GetCalendarEvents = (oauth2Client, startDate, endDate) => {
    return new Promise((resolve, reject) =>{
        calendar.events.list({
            auth: oauth2Client,
            calendarId: 'primary',
            timeMin: moment(startDate).toISOString(),
            timeMax: moment(endDate).toISOString(),
            maxResults: 10,
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
                    let startDate = moment(event.start.dateTime);
                    let endDate = moment(event.end.dateTime);
                    return {
                        event_id: event.id,
                        summary: event.summary,
                        startDate: startDate.format('YYYY-MM-DD HH:mm'),
                        startHour: startDate.hour(),
                        endDate: endDate.format('YYYY-MM-DD HH:mm'),
                        endHour: endDate.hour()
                    };
                }).then((new_events) => {
                    return resolve(new_events);
                });
            }
        });
    });
}