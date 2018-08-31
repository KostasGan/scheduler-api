function SignOutUser() {
    gapi.auth2.getAuthInstance().signOut();
}

function checkValidEmails(attendees) {
    var re = /^(([^<>()\[\]\\.:@"]+(\.[^<>()\[\]\\.:@"]+)*)|(".+"))@((\[[^0-9]{1,3}\.[^0-9]{1,3}\.[^0-9]{1,3}\.[^0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emails = attendees.trim().split(',');
    let wrong_emails = 0;

    emails.forEach((email) => {
        if (!re.test(String(email).toLowerCase())) {
            wrong_emails++;
        }
        return;
    });

    if (wrong_emails !== 0) {
        document.getElementById('attendees').classList.add('error');
        document.getElementById('msg').innerHTML = 'Wrong Email';
        document.getElementById('msg').style.color = 'red';
    }
    else {
        document.getElementById('attendees').classList.remove('error');
    }
}

function checkAvailableTime(available_time) {
    var re = /^(?:(([01]?\d|2[0-3]):([0-5]?\d))-(([01]?\d|2[0-3]):([0-5]?\d)))$/;
    let times = available_time.trim().split(',');
    let wrong_hours = 0;

    times.forEach((times) => {
        if (!re.test(String(times).toLowerCase()) && times !== '0') {
            wrong_hours++;
        }
        return;
    });

    if (wrong_hours !== 0) {
        document.getElementById('available_time').classList.add('error');
    }
    else {
        document.getElementById('available_time').classList.remove('error');
    }
}

function submitForm(data) {
    let response;
    let access_token = googleUser.getAuthResponse(true).access_token;

    let xhr = new XMLHttpRequest();
    xhr.open('POST', api + '/api/events/scheduler', true);
    xhr.timeout = 100000; // time in milliseconds
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('X-Access-Token', access_token);
    xhr.onreadystatechange = function () {
        document.querySelector('.btn').removeAttribute('disabled');

        if (xhr.readyState === 4 && xhr.status === 200) {
            response = JSON.parse(xhr.response);

            if (response.status === 'error') {
                document.getElementById('resp_msg').style.color = 'red';
                document.getElementById('resp_msg').innerHTML = response.message;
            }
            else if (response.data.length > 0) {
                let message = '<span> A new event created at: </span>';
                let suggested_date = '';
                response.data.forEach(function (dates) {
                    suggested_date = suggested_date + '<span style="font-weight:bold">' + dates + '</span>';
                });
                document.getElementById('resp_msg').innerHTML = message + '<br>' + suggested_date + '<br>' + 'Email Invitation to Atteendees was sent successfully';
                document.getElementById('resp_msg').style.color = 'black';
            }
            else {
                document.getElementById('resp_msg').innerHTML = response.message;
                document.getElementById('resp_msg').style.color = 'black';
            }
        }

        if (xhr.readyState == 4 && xhr.status == 401) {
            response = JSON.parse(xhr.response);

            if (response.error_code === 'main_user_not_found'){
                alert('Session expired. Please login again');
                window.location.pathname = '/login.html';
            }

            if (response.error_code === 'unauthorized_friends' && response.data.users.length > 0) {
                let r = confirm("Some Attendees haven't active session or permission. Do you want to send invitation ?");
                if (r) {
                    let unauthorized = response.data.users.toString();
                    let xhr = new XMLHttpRequest();
                    xhr.open('POST',
                        api + '/api/user/invite', true);
                    xhr.timeout = 15000; // time in milliseconds
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xhr.setRequestHeader('X-Access-Token', access_token);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            response = JSON.parse(xhr.response);
                            document.getElementById('resp_msg').innerHTML = response.message;
                        }
                    }
                    xhr.send('email_list=' + unauthorized);
                }
            }
        }
    };
    xhr.ontimeout = function (e) {
        document.getElementById('resp_msg').style.color = 'red';
        document.getElementById('resp_msg').innerHTML = 'Huston we have a problem...! Try again later.';
    };
    xhr.send(JSON.stringify(data));
}