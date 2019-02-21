"use strict";

const ASU_LONG = 33.4187;
const ASU_LAT = -111.9347;
const ZOOM = 16;

// this is the URL we need for communicating with our back end
const apiURL = "https://9j600ki9gk.execute-api.us-west-2.amazonaws.com/default/scoot-radar";

const basemaps = {
    positron: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    darkMatter: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    toner: "http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png",
    terrain: "http://{s}.sm.mapstack.stamen.com/(terrain)/{z}/{x}/{y}.png",
    waterColor: "http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
};

// this is the map object initialization
const map = new L.Map("mapid", {
    center: [ASU_LONG, ASU_LAT],
    zoom: ZOOM,
    maxZoom: ZOOM + 2
}).addLayer(new L.TileLayer(basemaps.darkMatter));

// variables needed globally
let heat = L.heatLayer();
let storedData = [];

$(document).ready(() => {
    // initialize tooltips
    $('[data-toggle="tooltip"]').tooltip()

    // initialize the date-picker
    initializeDayPicker();

    // add the re-center button to the map
    L.easyButton("fa fa-crosshairs fa-lg", centerMap, "Re-center").addTo(map);

    // invoke live-btn click to populate live data
    $('#live-btn').click();
});

function centerMap() {
    map.setView([ASU_LONG, ASU_LAT]);
}

function initializeDayPicker() {

    // set the endDate (today) as the last selectable option, and startDate as first
    let endDate = new Date();
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // set datepicker configuration options
    let date_input = $('input[name="date"]');
    let container = "body";
    let options = {
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
        startDate: startDate,
        endDate: endDate
    };

    // apply options and register changeDate event function handler
    date_input.datepicker(options)
        .on('changeDate', datePicker_changeDate);
}

function datePicker_changeDate() {

    // fade the text of the live-btn and show the hour-select
    $('#live-btn').css('color', '#8e8e8e');
    $('#hour-select').css('visibility', '');
    $('#date-load-indicator').css('display', '');
    $('#notification-text').text("");

    // get date from date-picker
    let date = $("#date-picker").val();

    // query database
    $.ajax({
        type: 'GET',
        url: apiURL,
        data: `date=${date}`,
        success: (response) => {
            // stop load indicator, notify
            $('#date-load-indicator').css('display', 'none');
            console.log('AJAX successful');

            // store data; attributes: Count, Items, ScannedCount
            let data = response;

            console.log(`${data.Count} items retrieved from DynamoDB`);
            console.log(data);

            // iterate and store items; attributes: recordID, record, dateCreated, ttl
            storedData = [];
            data.Items.forEach((item) => {
                storedData.push([item.recordID, item.record]);
            })

            // display initial record
            let time = $('#hour-select option:selected').val();
            let datetime = `${date} ${time}`;

            // set hourly data for whatever is selected and focus select input
            showHourlyData(datetime);
            $('#hour-select').focus();
        },
        error: (error) => {
            $('#date-load-indicator').css('display', 'none');
            console.error(error);
        }
    });
}

$('.tool-tip').focus(() => {
    // hide tooltip for elementa while focused 
    $('.tool-tip:focus').tooltip('hide');
});

function showHourlyData(datetime) {
    // display the data set which correlates with the hour passed as a parameter

    // get datetime as the formatted string, get hour to display
    let datetimeString = Util.getTimeString(datetime);
    let hourToDisplay = datetimeString.substring(0, 11) + "";
    //console.log('Hour to match: ' + hourToDisplay);

    // store data for the record time that matches the hour
    let dataToDisplay = null,
        birds = null;
    for (let item of storedData) {
        let recordHour = item[0].substring(0, 11) + "";
        //console.log('- Hour: ' + recordHour);

        // set dataToDisplay if record matches hour
        if (recordHour == hourToDisplay) {
            dataToDisplay = JSON.parse(item[1]);
            birds = dataToDisplay.birds;
            break;
        }
    }

    // if a record was matched, populate as long as there are birds
    if (birds) {
        if (birds.length == 0) {
            // notify there are no birds to display
            $('#notification-text').html("<small>No birds to display</small>");
        } else {
            addHeat(birds);
            $('#notification-text').text("");
            $('#notification-text').html(`<small>Displaying ${birds.length} birds</small>`);
        }
    }
    // no matched record, just notify
    else {
        $('#notification-text').html("<small>No data :(</small>");
    }
}

$('#test-btn').click(() => {
    console.log('testBtn_click fired');

    // test stuff ...
});

$('#live-btn').click(() => {

    // set color of live-btn back to normal, clear date-picker, hide hour-select
    $('#live-btn').css('color', '#ffffff');
    $('#date-picker').val('').datepicker('update');
    $('#hour-select').css('visibility', 'hidden');
    $('.fa-refresh').addClass('fa-spin');
    $('#notification-text').text("");

    // get live data
    $.ajax({
        type: 'GET',
        url: apiURL,
        success: (response) => {
            // get date for now
            let localDateNow = (new Date(Date.now())).toLocaleTimeString();

            // stop loading, notify
            $('.fa-refresh').removeClass('fa-spin');
            $('#notification-text').html(`<small>Last updated: ${localDateNow}</small>`);
            console.log('AJAX successful');

            // store data from response, add to map
            let data = JSON.parse(response);
            let birds = data.birds;
            addHeat(birds);
        },
        error: (error) => {
            $('.fa-refresh').removeClass('fa-spin');
            console.error(error);
        }
    });
});

$('#hour-select').keydown((e) => {
    // if left key is pressed
    if (e.keyCode == 37) {
        prevHour();
    }
    // if right key is pressed
    else if (e.keyCode == 39) {
        nextHour();
    }
    $("#hour-select").trigger('change');
});

$('#hour-select').change(() => {
    // get day, hour, pass to showHourlyData
    let date = $("#date-picker").val();
    let time = $('#hour-select option:selected').val();
    let datetime = `${date} ${time}`;

    showHourlyData(datetime);
});

function prevHour() {
    // select the previous hour in the hour select list
    $("#hour-select > option:selected")
        .prop("selected", false)
        .prev()
        .prop("selected", true);
}

function nextHour() {
    // if on the last item in the list, return
    if ($("#hour-select option:last").is(":selected")) {
        return;
    }

    // select the next hour in the hour select list
    $("#hour-select > option:selected")
        .prop("selected", false)
        .next()
        .prop("selected", true);
}

function addHeat(birds) {
    // remove existing layer
    removeHeat();

    // we need an array of coordinates for the heat map
    let birdLocations = [];

    // iterate birds: push latitude, longitude, and 1 for radius of the heat circles
    for (let bird of birds) {
        birdLocations.push([bird.location.latitude, bird.location.longitude, 1]);
    }

    // using birdLocations array, add heat circles to our map object
    heat = L.heatLayer(birdLocations, {
        radius: 20,
        blur: 15,
        maxZoom: 17,
    }).addTo(map);
}

function removeHeat() {
    map.removeLayer(heat);
}