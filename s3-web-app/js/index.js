"use strict";

const ASU_LONG = 33.4187;
const ASU_LAT = -111.9347;
const ZOOM = 16;

// this is the URL we need for communicating with our back end
const apiURL = "https://9j600ki9gk.execute-api.us-west-2.amazonaws.com/default/scoot-radar";

// this is the map object initialization
const map = new L.Map("mapid", {
    center: [ASU_LONG, ASU_LAT],
    zoom: ZOOM,
    maxZoom: ZOOM + 2
}).addLayer(new L.TileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"));

// we need 'heat' to be available globally for when we remove it from the map
let heat = L.heatLayer();

// this adds the re-center button to the map
L.easyButton("fa fa-crosshairs fa-lg", centerMap, "Re-center").addTo(map);

// this is the first function that gets called when our web page loads
$(document).ready(function () {
    $('#live-btn').click();
    initializeDayPicker();
});

function centerMap() {
    map.setView([ASU_LONG, ASU_LAT]);
}

function initializeDayPicker() {
    console.log('initializeDayPicker fired')

    // set the endDate (today) as the last selectable option, and startDate as first
    let endDate = new Date();
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

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
    console.log('datePicker_changeDate fired');

    // fade the text of the live-btn and show the hour-select
    $('#live-btn').css('color', '#8e8e8e');
    $('#hour-select').css('display', '');

    // get date in epoch format
    let dateEpoch = $("#date-picker").val();
    dateEpoch = new Date(dateEpoch).getTime() / 1000;

    // query database
    // $.ajax({
    //     type: 'GET',
    //     url: apiURL,
    //     data: `date=${dateEpoch}`,
    //     success: (response) => {
    //         console.log('AJAX successful');
    //         let data = JSON.parse(response);
    //         let birds = data.birds;
    //         addHeat(birds);
    //     }, 
    //     error: (error) => {
    //         console.error(error);
    //     } 
    // });
}

async function liveBtn_click() {
    console.log('liveBtn_click fired');

    // set color of live-btn back to normal, clear date-picker, hide hour-select
    $('#live-btn').css('color', '#ffffff');
    $('#date-picker').val('').datepicker('update');
    $('#hour-select').css('display', 'none');
    $('.fa-refresh').addClass('fa-spin');

    // get live data
    $.ajax({
        type: 'GET',
        url: apiURL,
        success: (response) => {
            $('.fa-refresh').removeClass('fa-spin');
            console.log('AJAX successful');
            let data = JSON.parse(response);
            let birds = data.birds;
            map.removeLayer(heat);
            addHeat(birds);
        },
        error: (error) => {
            $('.fa-refresh').removeClass('fa-spin');
            console.error(error);
        }
    });
}

// keydown event registration for the hour-select input
$("#hour-select").keydown((e) => {
    if (e.keyCode == 37) { // left
        prevHour();
    } else if (e.keyCode == 39) { // right
        nextHour();
    }
});

function prevHour() {
    console.log('prevHour fired');

    $("#hour-select > option:selected")
        .prop("selected", false)
        .prev()
        .prop("selected", true);
}


function nextHour() {
    console.log('nextHour fired');

    $("#hour-select > option:selected")
        .prop("selected", false)
        .next()
        .prop("selected", true);
}

function testBtn_click() {

}

function getStoredData(date) {
    alert('getStoredData handler fired');

    // $.ajax({
    //     type: 'GET',
    //     url: apiURL,
    //     data: `date=${date}`,
    //     success: (response) => {
    //         console.log('AJAX successful');
    //         let data = JSON.parse(response);
    //         let birds = data.birds;
    //         addHeat(birds);
    //     }, 
    //     error: (error) => {
    //         console.error(error);
    //     } 
    // });
}

function addHeat(birds) {
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

    console.log(`data added for ${birds.length} birds`);
}