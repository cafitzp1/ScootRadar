"use strict";

//--- DATA ---//

const ASU_LONG = 33.4187;
const ASU_LAT = -111.9347;
const ZOOM = 16;
const apiURL = "https://9j600ki9gk.execute-api.us-west-2.amazonaws.com/default/scoot-radar";

let layers = {
    positronMap: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
        id: 'map.positron'
    }),
    voyagerMap: L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", {
        id: 'map.voyager'
    }),
    darkMatterMap: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
        id: 'map.darkMatter'
    }),
    markersOverlay: L.layerGroup(),
    heatOverlay: L.heatLayer(),
    clusterOverlay: L.markerClusterGroup()
};

const map = new L.Map("mapid", {
    center: [ASU_LONG, ASU_LAT],
    zoom: ZOOM,
    maxZoom: ZOOM + 2,
    layers: [layers.darkMatterMap]
});

const baseMaps = {
    "Positron": layers.positronMap,
    "Voyager": layers.voyagerMap,
    "Dark Matter": layers.darkMatterMap,
};

const overlays = {
    "Markers": layers.markersOverlay,
    "Heat": layers.heatOverlay,
    "Clusters": layers.clusterOverlay
}

// let layerControl = L.control.layers(baseMaps, overlays, {}).addTo(map);
let storedData = [];
let activeThemeLayer = "";

//--- METHODS ---//

$(document).ready(() => {
    // initialize tooltips
    $('[data-toggle="tooltip"]').tooltip()

    // initialize the date-picker
    initializeDayPicker();

    // add the re-center button to the map
    L.easyButton("fa fa-crosshairs fa-lg", centerMap, "Re-center").addTo(map);

    // select starting basemap and overlay
    $('#voyager-radio').click();
    $('#clusters-check').click();

    // invoke live-btn click to populate live data
    $('#live-btn').click();
});

const centerMap = () => {
    map.setView([ASU_LONG, ASU_LAT]);
};

const initializeDayPicker = () => {

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
};

const datePicker_changeDate = () => {

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

            // store data; attributes: Count, Items, ScannedCount
            let data = response;

            console.log(`${data.Count} items retrieved`);
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
};

const showHourlyData = (datetime) => {
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
            addOverlays(birds);
            $('#notification-text').text("");
            $('#notification-text').html(`<small>Displaying ${birds.length} birds</small>`);
        }
    }
    // no matched record, just notify
    else {
        $('#notification-text').html("<small>No data :(</small>");
    }
};

const prevHour = () => {
    // select the previous hour in the hour select list
    $("#hour-select > option:selected")
        .prop("selected", false)
        .prev()
        .prop("selected", true);
};

const nextHour = () => {
    // if on the last item in the list, return
    if ($("#hour-select option:last").is(":selected")) {
        return;
    }

    // select the next hour in the hour select list
    $("#hour-select > option:selected")
        .prop("selected", false)
        .next()
        .prop("selected", true);
};

const addOverlays = (data) => {
    console.log('addOverlays fired');

    // get parsed data for individual add overlay methods
    let birdData = returnBirdData(data);

    // add if checked, remove else
    if ($('#markers-check').is(':checked')) {
        console.log('markers checked');
        addMarkersOverlay(birdData.markers);
    } else {
        removeOverlay(layers.markersOverlay);
    }

    if ($('#heatmap-check').is(':checked')) {
        console.log('heatmap checked');
        addHeatOverlay(birdData.heatCircles);
    } else {
        removeOverlay(layers.heatOverlay);
    }

    if ($('#clusters-check').is(':checked')) {
        console.log('clusters checked');
        addClustersOverlay(birdData.markers);
    } else {
        removeOverlay(layers.clusterOverlay);
    }
}

const returnBirdData = (response) => {
    let data = {
        heatCircles: [],
        markers: []
    }

    for (let item of response) {
        // for the heatmap
        data.heatCircles.push([item.location.latitude, item.location.longitude, 1]);
        // for the clusters
        let marker = L.marker([item.location.latitude, item.location.longitude]);
        let battery = item.battery_level;
        if (battery > 90) {
            marker.bindPopup(`<i class="fa fa-battery-full" aria-hidden="true"></i> ${item.battery_level}`);
        } else if (battery > 65) {
            marker.bindPopup(`<i class="fa fa-battery-three-quarters" aria-hidden="true"></i> ${item.battery_level}`);
        } else if (battery > 40) {
            marker.bindPopup(`<i class="fa fa-battery-half" aria-hidden="true"></i> ${item.battery_level}`);
        } else if (battery > 15) {
            marker.bindPopup(`<i class="fa fa-battery-quarter" aria-hidden="true"></i> ${item.battery_level}`);
        } else {
            marker.bindPopup(`<i class="fa fa-battery-empty" aria-hidden="true"></i> ${item.battery_level}`);
        }
        data.markers.push(marker);
    }

    return data;
}

const addMarkersOverlay = (markers) => {
    // save prev
    let prevLayer = layers.markersOverlay;
    // generate layer
    layers.markersOverlay = new L.layerGroup(markers);
    // remove existing, add new
    if (map.hasLayer(prevLayer)) {
        map.removeLayer(prevLayer);
    }
    map.addLayer(layers.markersOverlay);
}

const addHeatOverlay = (heatCircles) => {
    // save prev
    let prevLayer = layers.heatOverlay;
    // generate layer
    layers.heatOverlay = new L.heatLayer(heatCircles, {
        radius: 20,
        blur: 15,
        maxZoom: 17
    });
    // remove existing, add new
    if (map.hasLayer(prevLayer)) {
        map.removeLayer(prevLayer);
    } else {}
    map.addLayer(layers.heatOverlay);
};

const addClustersOverlay = (markers) => {
    // save prev
    let prevLayer = layers.clusterOverlay;
    // generate layer
    layers.clusterOverlay = new L.markerClusterGroup();
    layers.clusterOverlay.addLayers(markers);
    // remove existing, add new
    if (map.hasLayer(prevLayer)) {
        map.removeLayer(prevLayer);
    }
    map.addLayer(layers.clusterOverlay);
};

const removeOverlay = (overlay) => {
    if (map.hasLayer(overlay)) {
        map.removeLayer(overlay);
    }
}

const removeAllOverlays = () => {
    map.removeLayer(layers.markersOverlay);
    map.removeLayer(layers.heatOverlay);
    map.removeLayer(layers.clusterOverlay);
};

const addAllOverlays = () => {
    map.addOverlay(layers.markersOverlay);
    map.addOverlay(layers.heatOverlay);
    map.addOverlay(layers.clusterOverlay);
};

const changeTheme = (prevLayer) => {
    if (prevLayer) {
        map.removeLayer(prevLayer);
    }
    map.addLayer(activeThemeLayer);
};

//--- EVENT HANDLERS ---//

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

            // store data from response, add to map
            let data = JSON.parse(response);
            data = data.birds;
            addOverlays(data);
        },
        error: (error) => {
            $('.fa-refresh').removeClass('fa-spin');
            console.error(error);
        }
    });
});

$('#hour-select').change(() => {
    // get day, hour, pass to showHourlyData
    let date = $("#date-picker").val();
    let time = $('#hour-select option:selected').val();
    let datetime = `${date} ${time}`;

    showHourlyData(datetime);
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

$('input[type=radio][name=theme-radio]').change(() => {
    // set active theme when radio is changed
    let baseMap = $('input[type=radio][name=theme-radio]:checked').val();
    let prevLayer = activeThemeLayer;
    activeThemeLayer = layers[baseMap + "Map"];

    // change to active theme
    changeTheme(prevLayer);
});

$('.visualization-check').change((e) => {
    //console.log(e.target.value);
})

$('.tool-tip').focus(() => {
    // hides tooltips for most elements
    $('.tool-tip:focus').tooltip('hide');
});

$('.tool-tip-child').focus(() => {
    // hides tooltips for divs (theme and visualization dropdown btns are divs)
    $('.tool-tip-child').parent().tooltip('hide');
});

$('.nav-style-dd div label').click((e) => {
    // prevents the theme and visualization dropdowns from disappearing when click labels
    e.stopPropagation();
});