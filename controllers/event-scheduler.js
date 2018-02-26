const google = require('googleapis');
const googleAuth = require('google-auth-library');
const Promise = require('bluebird');
const moment = require('moment');

let auth = new googleAuth();
let calendar = google.calendar('v3');
let unAuthUsers = [];
let oauth2Client;



exports.GetCalendarEvents = (credentials, ac_token) => {
    oauth2Client = new auth.OAuth2(credentials.client_id, credentials.client_secret, credentials.redirect_uris);
    oauth2Client.credentials = {"access_token": ac_token};

    calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
            return new Promise((resolve, reject) => { resolve([])})
        } else {
            // return Promise.map(events, (event) => {
            //     let structure = {
            //         email: '',
            //         summary: '',
            //         description: '',
            //         startDate: new Date(event.start.date),
            //         startHour: new Date(event.start.dateTime),
            //         endDate: new Date(event.end.date),
            //         endDate: new Date(event.end.dateTime)
            //     };


            // });
        }
    });
}