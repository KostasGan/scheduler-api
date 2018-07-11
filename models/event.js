const db = require('../helpers/db');
const Promise = require('bluebird');
const date_helper = require('../helpers/date');
const Schema = db.mongoose.Schema;

let event;

const EventSchema = new Schema({
    event_id: { type: String, required: true },
    summary: { type: String, required: true },
    startDate: { type: Date, required: true },
    startHour: { type: Number, required: true },
    endDate: { type: Date, required: true },
    endDateHour: { type: Number, required: true }
});

const EventListSchema = new Schema({
    email: { type: String, required: true },
    events: { type: [EventSchema], required: true }
});

EventListSchema.statics._constructor = (email, events) => {
    return Promise.map(events, (event) => {
        let startDate = date_helper.initDateWithTimezone(event.start.dateTime);
        let endDate = date_helper.initDateWithTimezone(event.end.dateTime);
        
        return {
            event_id: event.id,
            summary: event.summary,
            startDate: startDate.toISOString(),
            startHour: startDate.hour(),
            endDate: endDate.toISOString(),
            endHour: endDate.hour()
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