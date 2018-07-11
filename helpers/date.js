const Promise = require('bluebird');
const moment = require('moment');

exports.formatDateWithTime = (startDate, diffDate, available_time) => {
    let range = [];

    for (let i = 0; i <= diffDate; i++) {
        let av_time = available_time[i].trim().split(/[":\-"]/);
        let new_date = new moment(startDate.toISOString());
        console.log(new_date);
        if (av_time[i] !== '0' && av_time[i + 1] !== '0') {
            range.push({
                'startDate': new_date.add(i, 'd').set({ 'hour': av_time[0], 'minutes': av_time[1] }).toISOString(),
                'endDate': new_date.set({ 'hour': av_time[2], 'minutes': av_time[3] }).toISOString()
            });
        }
    }
    return Promise.all(range);
}