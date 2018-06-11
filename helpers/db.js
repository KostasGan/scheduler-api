const config = require('config');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;


let uri = config.get('db.host') + ':' + config.get('db.port') + '/' + config.get('db.db_name');
mongoose.connect(uri, { 
    autoReconnect: true,
    reconnectTries: 5,
    reconnectInterval: 500,
    useMongoClient: true
}).then(() => {
    console.log('Connection to MongoDB established!');
}).catch((e) => {
    console.log('Problem with the connection \n' + e);
});

exports.mongoose = mongoose;

// exports.connect = (() => {
//     mongoose.connect();
// });

// exports.close = (() => {
//     mongoose.disconnect();
// })
