const db = require('../helpers/db');
const Promise = require('bluebird');
const date_helper = require('../helpers/date');
const Schema = db.mongoose.Schema;

let event;

/**
 * Create a new Moongose Schema
 */
const EventSchema = new Schema({
    event_id: { type: String, required: true },
    summary: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

const EventListSchema = new Schema({
    email: { type: String, required: true },
    events: { type: [EventSchema], required: true }
});

/**
 * Create an new EventObject of events with necessary infos
 * @param {String} email 
 * @param {Object} events
 * @returns {Event}
 */
EventListSchema.statics._constructor = (email, events) => {
    return Promise.map(events, (event) => {
        let startDate = date_helper.initDateWithTimezone(event.start.dateTime);
        let endDate = date_helper.initDateWithTimezone(event.end.dateTime);
        
        return {
            event_id: event.id,
            summary: event.summary,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }).then((new_events) => {
        return new event({
            email: email,
            events: new_events
        });
    });
}

event = db.mongoose.model('events', EventListSchema);
exports.Model = event;