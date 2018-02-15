const db = require('../helpers/db');
const Promise = require('bluebird');
const Schema = db.mongoose.Schema;

let EventSchema = new Schema({
    email: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

exports.Event = class Event {
    constructor(summary, description, startDate, endDate){
        this.summary = summary;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    getSummary() { return this.summary; }
    getStartDate() { return this.startDate; }
    getEndDate() { return this.endDate; }

};