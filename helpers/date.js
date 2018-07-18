const Promise = require('bluebird');
const moment = require('moment-timezone');

let timezone = 'Europe/Athens';

exports.initDateWithTimezone = (date) => {
    return new moment(date).tz(timezone);
}

exports.formatSuggestedDates = (startDate, endDate) => {
    let new_startdate = exports.initDateWithTimezone(startDate);
    let new_enddate = exports.initDateWithTimezone(endDate);

    return `${new_startdate.format('YYYY-MM-DD HH:mm')}-${new_enddate.format('HH:mm')}`;
}

exports.isBetweenTwoDates = (date, startRange, endRange) => {
    return moment(date).isBetween(startRange, endRange, null, '[]');
}

exports.formatDateWithTime = (startDate, diffDate, available_time) => {
    let range = [];

    for (let i = 0; i <= diffDate; i++) {
        let av_time = available_time[i].trim().split(/[":\-"]/);
        let newISOStartDate = startDate.toISOString();
        let new_date = exports.initDateWithTimezone(newISOStartDate);
        let new_enddate = exports.initDateWithTimezone(newISOStartDate);

        if (av_time[0] !== '0' && av_time[1] !== '0') {
            new_date.add(i, 'd').set({ 'hour': av_time[0], 'minutes': av_time[1] });
            new_enddate.add(i, 'd').set({ 'hour': av_time[2], 'minutes': av_time[3] });

            range.push({
                'startDate': new_date.toISOString(),
                'endDate': new_enddate.toISOString()
            });
        }
    }
    return Promise.all(range);
}

exports.createSuggestedDate = (start, end, duration) => {
    let min  = moment(start).hour();
    let max = moment(end).hour();

    let randomTime = Math.floor(Math.random() * (max - min)) + min;
    let newStart = new moment(start).tz(timezone).set({ 'hour': randomTime });
    let newEnd = new moment(newStart).tz(timezone).set({ 'minutes': duration });

    return {
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString()
    }
}