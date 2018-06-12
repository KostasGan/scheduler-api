const Promise = require('bluebird');
const Email = require('../helpers/email');


exports.registerRoutes = function(app, config) {
    app.post("/api/send_email", (req,res) => {
        Email.send_Email(config);
    });
}