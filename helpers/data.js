const Promise = require('bluebird');


/**
 * Check with Regex that email format is valid
 * @param {String} attendees
 * @returns {Integer}
 */
exports.checkValidEmails = (attendees) => {
    var re = /^(([^<>()\[\]\\.:@"]+(\.[^<>()\[\]\\.:@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emails = attendees.trim().split(',');
    let wrong_emails = 0;
    return Promise.each(emails, (email) => {
        if (!re.test(String(email.trim()).toLowerCase())) {
            wrong_emails++;
        }
        return;
    }).then(() => {
        return Promise.resolve(wrong_emails);
    });
}

/**
 * Check format of available_time that contain valid date/hour format
 * @param {String} available_time
 * @returns {Integer}
 */
exports.checkAvailableTime = (available_time) => {
    var re = /^(?:(([01]?\d|2[0-3]):([0-5]?\d))-(([01]?\d|2[0-3]):([0-5]?\d)))$/;
    let wrong_times = 0;
    return Promise.each(available_time, (time) => {
        if (!re.test(String(time.trim())) && time !== '0') {
            wrong_times++;
        }
        return;
    }).then(() => {
        return Promise.resolve(wrong_times);
    });
}
