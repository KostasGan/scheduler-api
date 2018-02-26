const db = require('../helpers/db');
const Promise = require('bluebird');
const Schema = db.mongoose.Schema;

const event;

const EventSchema = new Schema({
    email: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    startHour: { type: Date, required: true },
    endDate: { type: Date, required: true },
    endDateHour: { type: Date, required: true }
});

const EventListSchema = new Schema({
    email: { type: String, required: true },
    events: { type: [EventSchema], required: true }
});


EventSchema.statics.DateToTime = () => {
    Promise.map(this.event, (event) => {
        return {
            event: this.event,
            startDateTime: startDate.getTime(),
            endDateTime: endDate.getTime()
        };
    }).then((fevent)=>{
        Promise.resolve(fevent);
    });
}

event = db.mongoose.model('events', EventSchema);
exports.Model = event;