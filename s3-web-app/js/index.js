"use strict";

// x: lower value = down, y: lower value = to the right 
const ASU_LONG = 33.4187;
const ASU_LAT = -111.9347;
const ZOOM = 16;

const api_url = "https://9j600ki9gk.execute-api.us-west-2.amazonaws.com/default/scoot-radar";

const map = new L.Map("mapid", {
    center: [ASU_LONG, ASU_LAT],
    zoom: ZOOM,
    maxZoom: ZOOM + 2,
    minZoom: ZOOM - 1
}).addLayer(new L.TileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"));

$(document).ready(function () {
    getLiveData();
});

async function getLiveData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', api_url, true);
    xhr.responseType = 'json';
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let birds = JSON.parse(this.response).birds;
            addHeat(birds);
        }
    }
}

function addHeat(birds) {
    let birdLocations = [];

    for (let bird of birds) {
        birdLocations.push([bird.location.latitude, bird.location.longitude, 1]);
    }

    let heat = L.heatLayer(birdLocations,{
        radius: 20,
        blur: 15, 
        maxZoom: 17,
    }).addTo(map);
}