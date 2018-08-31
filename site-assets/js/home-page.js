let event_start;
let event_end;
let selectHour = '<option></option>';
let selectMin = '<option></option>';

(function () {
    for (i = 0; i < 24 ; i++){;
        if (i < 10){
            selectHour = selectHour + "<option class='select' value='"+ i +"'>0"+ i + '</option>'
        } else {
            selectHour = selectHour + "<option class='select' value='"+ i +"'>"+ i + '</option>'
        }
    }
    for(i=0; i < 60; i+=5){
        if (i < 10){
            selectMin = selectMin + "<option value='"+ i +"'>0"+ i + '</option>'
        } else {
            selectMin = selectMin + "<option value='"+ i +"'>"+ i + '</option>'
        }
    }
})()

$('#available_time').popover({
    'title': 'Select availability time!',
    "html": true,
    'content': "<div class='row selectAvailability'> <b style='margin:auto' class='col'>From</b> <select id='startHour' class='col custom-select'>" + selectHour + "</select> <select id='startMin' class='col custom-select'>" + selectMin + "</select> </div>" + 
                "<div class='row selectAvailability'> <p style='margin:auto' class='col'> <b>To</b></p> <select id='endHour' class='col custom-select' disabled>" + selectHour + "</select> <select id='endMin' class='col custom-select' disabled>" + selectMin + "</select></div>" + 
                "<div class='row selectAvailability' style= 'margin: auto 0'> <b><p> or </p></b></div>" +
                "<div class='row selectAvailability'><button class='btn col' id='free_day'> Free Day </button> <button class='btn col' id='clear'>Clear</button></div>",
    'placement': 'bottom'
});

$('#event_date').daterangepicker({
    'locale': {
        'format': 'DD-MM-YYYY',
        'separator': ' - ',
    },
    'opens': 'left',
    'minDate': new moment()
}, function (start, end, label) {
    event_start = start.format('YYYY-MM-DD');
    event_end = end.format('YYYY-MM-DD');
});

$('input:not(#available_time)').on('click focus', function() {
    $('#available_time').popover('hide');
});
$('button:not(#available_time)').on('click', function() {
    $('#available_time').popover('hide');
});

$('#available_time').on('shown.bs.popover', function(event) {
    $('#startHour').on('change', function (event) {
        let disabledOptions = $('#endHour option:disabled');
        
        if (disabledOptions.length > 0 ) {
            for(i = 0 ; i < disabledOptions.length; i++){
                let index = (disabledOptions[i].index) + 1;
                $('#endHour option:nth-child(' + index + ')').prop('disabled', false);
            }
        }

        let val = parseInt($('#startHour option:selected').val());

        if (val !== 23){
            for (i = 0; i <= val+1; i++) {
                $('#endHour option:nth-child(' + i + ')').prop('disabled', true);
            }
        } else {
            $('#endHour option:nth-child(' + (val+2) + ')').prop('disabled', true);
        }
    });
    
    $('#free_day').on('click', function(event) {
        let availability = $('#available_time').val();
            
        if (availability !== ''){
            let newVal = availability +  ',' + '0';
            $('#available_time').val(newVal)
        } else {
            let newVal = '0';
            $('#available_time').val(newVal);
        }
        $('#available_time').popover('hide');
    });

    $('#clear').on('click', function(event) {
        $('#available_time').val('');
        $('#available_time').popover('hide');
    });

    $('select').on('change', function (event) {
        
        let startVal = $('#startHour option:selected').text();
        let startMinVal = $('#startMin option:selected').text();
        let endVal = $('#endHour option:selected').text();
        let endMinVal = $('#endMin option:selected').text();
        var newVal = '';
        
        if(startVal !== '' && startMinVal !== ''){
            $('#endHour').prop('disabled', false);
            $('#endMin').prop('disabled', false);
        }

        if (startVal !== '' && startMinVal !== '' && endVal !== '' && endMinVal !== '') {
            let availability = $('#available_time');
            let availabilityText = availability.val()

            if (availabilityText.indexOf('00:00-00:00') > -1) {
                availabilityText.replace('00:00-00:00', '');
                availability.val(availabilityText);
            } else if (availabilityText !== '' ){
                newVal = availabilityText + ',' + startVal.trim() + ':' + startMinVal.trim() + '-' + endVal.trim() + ':' + endMinVal.trim();
            } else {
                newVal = startVal.trim() + ':' + startMinVal.trim() + '-' + endVal.trim() + ':' + endMinVal.trim();
            }

            if(newVal.indexOf('00:00-00:00') < 0 ){
                availability.val(newVal);
            }
            $('#available_time').popover('hide');
        }
    });
});
