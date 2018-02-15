const config = require('config');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;


let uri = config.get('db.host') + ':' + config.get('db.port') + '/' + config.get('db.db_name');
mongoose.connect(uri, { useMongoClient: true }).then(() => {
    console.log('Connection to MongoDB established!');
}).catch((e) => {
    console.log('Problem with the connection \n' + e);
});

// let CalendarUserSchema = new Schema({
//     email: { type: String, required: true },
//     ac_token: { type: String, required: true },
//     friends_list: { type: [String] }
// });

// let user = mongoose.model('calendar_users', CalendarUserSchema);

// exports.findUser = ((email) => {
//     return user.findOne({ email: email }).then((user) => {
//         return user;
//     });
// });

// exports.UpdateUser = (new_email, token) => {
//     user.update({ email: new_email }, {ac_token: token}).then((response) => {
//         console.log(response);
//     });
// };

// exports.CreateUser = (email, token, friends) => {

//     let new_user = new user({
//         email: email,
//         ac_token: token,
//         friends_list: friends || []
//     });

//     return new_user.save().then(() => {
//         return 'Complete';
//     }).catch((e) => {
//         console.log('We have a problem \n' + e);
//         return 'Failed';
//     });
// };

exports.mongoose = mongoose;
// exports.connect = (() => {
//     mongoose.connect();
// });

// exports.close = (() => {
//     mongoose.disconnect();
// })
