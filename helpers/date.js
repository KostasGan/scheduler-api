const Promise = require('bluebird');
const moment = require('moment-timezone');

exports.formatDateWithTime = (startDate, diffDate, available_time) => {
    let range = [];
    let timezone = 'Europe/Athens';
    for (let i = 0; i <= diffDate; i++) {
        let av_time = available_time[i].trim().split(/[":\-"]/);
        let newISOStartDate = startDate.toISOString();
        let new_date = new moment(newISOStartDate).add(i, 'd');
        let new_enddate = new moment(newISOStartDate).add(i, 'd');

        if (av_time[i] !== '0' && av_time[i + 1] !== '0') {
            new_date.set({ 'hour': av_time[0], 'minutes': av_time[1] });
            new_enddate.set({ 'hour': av_time[2], 'minutes': av_time[3] })
            console.log(new moment().format());
            let ss = new_date.tz(timezone).toISOString();
            let sss = new_enddate.tz(timezone).toISOString();
            range.push({
                'startDate': ss,
                'endDate': sss
            });
        }
    }
    console.log(range)
    return Promise.all(range);
}