const google = require('googleapis');
const googleAuth = require('google-auth-library');
const request = require('request');
const Promise = require('bluebird');
const userModel = require('../models/user').Model;

let resp;

// exports.authorize = (credentials, SCOPES) => {
//     var clientSecret = credentials.client_secret;
//     var clientId = credentials.client_id;
//     var redirectUrl = credentials.redirect_uris[0];
//     var auth = new googleAuth();
//     var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

//     var authUrl = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES
//     });

//     return { "url": authUrl, "oauth2Client": oauth2Client };
// };

exports.authorizeClient = (credentials, access_token) => {
    let url = 'https://www.googleapis.com/oauth2/v2/tokeninfo';
    let options = {
        'url': url,
        'form': {
            'access_token': access_token.trim() || ''
        }
    };

    return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try{
                    resp = JSON.parse(body);
                }
                catch(e){ 
                    console.log('JSON parse failed \n' + e);
                }
                
                if (resp.audience === credentials.client_id) {
                    userModel.findUser(resp.email).then((user) => {
                        if (user && user.ac_token !== access_token) {
                            userModel.UpdateUser(resp.email, access_token.trim());
                        }
                        else {
                            userModel.CreateUser(resp.email, access_token.trim()).then((val) => {
                                if (val === 'Complete') {
                                    resolve({ 'status': 'Validated User' });
                                }
                                else {
                                    resolve({ 'status': 'Failed' });
                                }
                            });
                        }
                    });
                }
            }
            else {
                resolve({ 'status': 'Failed' });
            }
        });
    });
};