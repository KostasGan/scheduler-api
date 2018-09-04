const db = require('../helpers/db');
const Promise = require('bluebird');
const Schema = db.mongoose.Schema;

let user;
let new_user;

const UserSchema = new Schema({
    email: { type: String, required: true },
    ac_token: { type: String, required: true },
    friends_list: { type: [String] },
    pending_invitation: { type: Boolean, default: false}
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

UserSchema.statics.UpdateUser = (email, token, invitation) => {
    invitation = invitation || false;

    user.update({ email: email }, {'$set': {'ac_token': token, 'pending_invitation': invitation}}).then((x) => { return });
}

UserSchema.statics.CreateUser = (email, access_token, friends_list, pending_invitation) => {
    new_user = new user({ 
        email: email, 
        ac_token: access_token, 
        friends_list: friends_list || [],
        pending_invitation: pending_invitation || false
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
                return user.CreateUser(friend_mail, ' ', [], true);
            }
            else{
                return friend;
            }         
        });
    });
}

user = db.mongoose.model('calendar_users', UserSchema);

exports.Model = user;