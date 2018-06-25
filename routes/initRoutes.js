exports.initSchedulerApiCalls = function(app, config) {
    require('./event-scheduler').registerRoutes(app, config);
    require('./auth_clients').registerRoutes(app, config);
    require('./send_email').registerRoutes(app, config);
}