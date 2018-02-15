const google = require('googleapis');
const googleAuth = require('google-auth-library');
const Promise = require('bluebird');

let auth = new googleAuth();
let calendar = google.calendar('v3');


exports.GetCalendarEvents = (credentialss, ac_token) => {
    let clientSecret = credentialss.client_secret;
    let clientId = credentialss.client_id;
    let redirectUrl = credentialss.redirect_uris;
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.credentials = {"access_token": ac_token};
    //console.log(oauth2Client);

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
        //var events = response.items;
        //console.log(response.items[0].start.dateTime);
    
         let startData = new Date((response.items[0].start.dateTime));
         let endData = new Date((response.items[0].end.dateTime));

        console.log(startData.getHours() - endData.getHours());
        // if (events.length == 0) {
        //     console.log('No upcoming events found.');
        // } else {
        //     console.log('Upcoming 10 events:');
        //     for (var i = 0; i < events.length; i++) {
        //         var event = events[i];
        //         var start = event.start.dateTime || event.start.date;
        //         console.log('%s - %s', start, event.summary);
        //     }
        // }
    });
}