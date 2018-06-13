const request = require('request');
const Promise = require('bluebird');
const userModel = require('../models/user').Model;

let resp, options;
let url = 'https://www.googleapis.com/oauth2/v2/tokeninfo';
let access_token;

exports.authorizeClient = (oauth2Client) => {
    access_token = oauth2Client.credentials.access_token;
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
                if (resp.audience === oauth2Client.clientId_) {
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
                    }).catch((e) => {
                        console.log(e);
                    });
                }
                else{
                    reject({
                        "status": "error",
                        "error_code": "bad_request"
                    });
                }
            }
            else {
                reject({ 'status': 'Failed' });
            }
        });
    });
};


exports.checkAuthToken = (oauth2Client) => {
    access_token = oauth2Client.credentials.access_token;
    options = {
        'url': url,
        'form': {
            'access_token': access_token || ''
        }
    };

    return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
            let data = JSON.parse(body);
            if(!error && response.statusCode === 400 && data.error_description === "Invalid Value"){
                resolve("Invalid Credentials");
                return;
            }
            else if(!error && response.statusCode === 200){
                resolve("Valid User");
                return;
            }
            else{
                reject((JSON.parse(body)).error_description);
                return;
            }
        });
    });
}