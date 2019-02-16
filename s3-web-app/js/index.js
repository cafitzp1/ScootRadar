"use strict";

const ASU_LONG = 33.4187;
const ASU_LAT = -111.9347;
const ZOOM = 16;

const apiURL = "https://9j600ki9gk.execute-api.us-west-2.amazonaws.com/default/scoot-radar";

const map = new L.Map("mapid", {
    center: [ASU_LONG, ASU_LAT],
    zoom: ZOOM,
    maxZoom: ZOOM + 2
}).addLayer(new L.TileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"));

// this is the first function that gets called when our web page loads
$(document).ready(function () {
    getLiveData();
    initializeDayPicker();

    // $("#live-btn").click(function () {
    //     alert("Handler for .click() called.");
    // });
});

function initializeDayPicker() {
    let date_input = $('input[name="date"]'); //our date input has the name "date"
    let container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
    let options = {
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
    };
    date_input.datepicker(options);
}

function getLiveData() {
    $.ajax({
        type: 'GET',
        url: apiURL,
        success: (response) => {
            console.log('AJAX successful');
            let data = JSON.parse(response);
            let birds = data.birds;
            addHeat(birds);
        },
        error: (error) => {
            console.error(error);
        }
    });
}

function initHistoricalData() {
    console.log('historical data init clicked');
    $('#date-input').prop('disabled', false);
    $('#submit-btn').prop('disabled', false);
}

function initLiveData() {
    console.log('live data init clicked');
    $('#date-input').prop('disabled', true);
    $('#submit-btn').prop('disabled', true);
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
    let heat = L.heatLayer(birdLocations, {
        radius: 20,
        blur: 15,
        maxZoom: 17,
    }).addTo(map);

    console.log(`data added for ${birds.length} birds`);
}