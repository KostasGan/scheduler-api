const db = require('../helpers/db');
const Promise = require('bluebird');
const Schema = db.mongoose.Schema;

let user;
let new_user;

const UserSchema = new Schema({
    email: { type: String, required: true },
    ac_token: { type: String, required: true },
    friends_list: { type: [String] }
});

UserSchema.statics.findUser = function(email) {
    return user.findOne({ email: email }).then((user) => {
        return user;
    }).catch((e) => {
        console.log('We have a problem \n' + e);
        return 'Failed';
    });
}

UserSchema.statics.findUserByAccessToken = function(access_token) {
    return user.findOne({ ac_token: access_token }).then((user) => {
        return user;
    }).catch((e) => {
        console.log('We have a problem \n' + e);
        return 'Failed';
    });
}

UserSchema.statics.UpdateUser = (email,token) => {
    user.update({ email: email }, {ac_token: token}).then((response) => {
        console.log(response);
    });
}

UserSchema.statics.CreateUser = (email, access_token, friends_list) => {
    new_user = new user({ 
        email: email, 
        ac_token: access_token, 
        friends_list: friends_list || []
    });
    
    return new_user.save().then(() => {
        return new_user;
    }).catch((e) => {
        console.log('We have a problem \n' + e);
        return 'Failed';
    });
}

UserSchema.statics.findFriendsAccessToken = (friends_emails) => {
    let friends_email_list = friends_emails.split(',');

    return Promise.map(friends_email_list, (friend_mail) => {
        return user.findUser(friend_mail).then((friend) => {
            if(friend === null){
                console.log('Create New User');
                return user.CreateUser(friend_mail, ' ', []);
            }
            else{
                return friend;
            }         
        });
    });
}

user = db.mongoose.model('calendar_users', UserSchema);

exports.Model = user;