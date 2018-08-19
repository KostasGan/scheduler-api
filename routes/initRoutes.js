/**
 * Init all available API Calls
 * @param {*} app 
 * @param {*} config 
 */
exports.initSchedulerApiCalls = function(app, config) {
    require('./event_scheduler').registerRoutes(app, config);
    require('./auth_clients').registerRoutes(app, config);
    require('./send_email').registerRoutes(app, config);
}