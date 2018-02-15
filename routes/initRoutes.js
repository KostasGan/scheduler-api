exports.initSchedulerApiCalls = function(app, config) {
    require('./default.js').registerRoutes(app, config);
}