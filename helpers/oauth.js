const google = require('googleapis');
const googleAuth = require('google-auth-library');
const request = require('request');
const Promise = require('bluebird');
const userModel = require('../models/user').Model;

let resp, options;
let url = 'https://www.googleapis.com/oauth2/v2/tokeninfo';


exports.authorizeClient = (credentials, access_token) => {
    options = {
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
                            resolve({ 'status': 'Validated User' });
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