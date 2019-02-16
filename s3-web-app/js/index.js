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
});

function getLiveData() {
    // let xhr = new XMLHttpRequest();
    // xhr.responseType = 'json';
    // xhr.open('GET', apiURL, true);
    // xhr.send(null);
    // xhr.onreadystatechange = function() {
    //     if (this.readyState === 4 && this.status === 200) {
    //         // API communicates with code in lambda-web-app, scooter data is returned
    //         let data = JSON.parse(this.response);
    //         let birds = data.birds;
    //         addHeat(birds);
    //     }
    // }

    $.ajax({
        type: 'GET',
        url: apiURL,
        data: 'date=20190216',
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