const googleAuth = require('google-auth-library');
const request = require('request');
const Promise = require('bluebird');
const userModel = require('../models/user').Model;

let url = 'https://www.googleapis.com/oauth2/v2/tokeninfo';

exports.initGoogleAuth = (config) => {
    let credentials = config.get('web');
    let auth = new googleAuth();
    let googleOauth2Client = new auth.OAuth2(credentials.client_id, credentials.client_secret);

    return googleOauth2Client;
}

exports.authorizeClient = (oauth2Client) => {
    let access_token = oauth2Client.credentials.access_token || '';
    let options = {
        'url': url,
        'form': {
            'access_token': access_token
        }
    };

    return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
            if (error || response.statusCode !== 200) return reject('error');

            let data = JSON.parse(body);

            if (data.audience !== oauth2Client.clientId_) return reject('error');
            
            userModel.findUser(data.email).then((user) => {
                let invitation = user ? user.pending_invitation : false;

                if (user) {
                    userModel.UpdateUser(data.email, access_token, false);
                    return resolve(invitation);
                }

                // if (user && user.ac_token === access_token) return resolve(invitation);
                
                userModel.CreateUser(data.email, access_token).then((val) => {
                    if (val === 'Failed') return reject('error');

                    return resolve(invitation);
                });
            })
            .catch((e) => {
                console.log(e);
                reject('error');
            });
        });
    });
}

exports.checkAuthToken = (oauth2Client) => {
    let access_token = oauth2Client.credentials.access_token || '';
    let options = {
        'url': url,
        'form': {
            'access_token': access_token
        }
    };

    return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
            let data = JSON.parse(body);
            if (!error && response.statusCode === 400 && data.error_description === 'Invalid Value') {
                resolve('Invalid Credentials');
                return;
            } else if (!error && response.statusCode === 200) {
                resolve('Valid User');
                return;
            } else {
                reject((JSON.parse(body)).error_description);
                return;
            }
        });
    });
}