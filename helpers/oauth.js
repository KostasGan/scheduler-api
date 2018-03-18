const request = require('request');
const Promise = require('bluebird');
const userModel = require('../models/user').Model;

let resp, options;
let url = 'https://www.googleapis.com/oauth2/v2/tokeninfo';


exports.authorizeClient = (oauth2Client) => {
    let access_token = oauth2Client.credentials.access_token;
    options = {
        'url': url,
        'form': {
            'access_token': access_token || ''
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
                
                if (resp.audience === oauth2Client.client_id) {
                    userModel.findUser(resp.email).then((user) => {
                        if (user && user.ac_token !== access_token) {
                            userModel.UpdateUser(resp.email, access_token);
                            resolve({ 'status': 'Validated User' });
                        }
                        else {
                            userModel.CreateUser(resp.email, access_token).then((val) => {
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