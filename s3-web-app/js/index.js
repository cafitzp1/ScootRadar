"use strict";

const ASU_LONG = 33.4187;
const ASU_LAT = -111.9347;
const ZOOM = 16;

const api_url = "https://9j600ki9gk.execute-api.us-west-2.amazonaws.com/default/scoot-radar";

const map = new L.Map("mapid", {
    center: [ASU_LONG, ASU_LAT],
    zoom: ZOOM,
    maxZoom: ZOOM + 2
}).addLayer(new L.TileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"));

// this is the first function that gets called when our web page loads
$(document).ready(function () {
    getLiveData();
});

async function getLiveData() {
    // xhr will request data from our API
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', api_url, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            // API communicates with code in 'lambda-web-app', scooter data is returned
            let data = JSON.parse(this.response),
                birds = data.birds;
            addHeat(birds);
        }
    }
}

function addHeat(birds) {
    // we need an array of coordinates for the heat map
    let birdLocations = [];

    // iterate birds: push latitude, longitude, and 1 for radius of the heat circles
    for (let bird of birds) {
        birdLocations.push([bird.location.latitude, bird.location.longitude, 1]);
    }

    let heat = L.heatLayer(birdLocations,{
        radius: 20,
        blur: 15, 
        maxZoom: 17,
    }).addTo(map);

    console.log(`data added for ${birds.length} birds`);
}