exports.initSchedulerApiCalls = function(app, config) {
    require('./default.js').registerRoutes(app, config);
    require('./send_email.js').registerRoutes(app, config);
}