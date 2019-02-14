"use strict";

const Bird = require('node-bird')
const bird = new Bird()

const SCOOT_RANGE_MI = 1;
const SCOOT_INTERVAL_MS = 600000; // 10 min
const ASU_LONG = 33.4166061;
const ASU_LAT = -111.9363706;
const AUTH = "";

async function init() {
    try {
        // wait for successful login, token is stored to bird object
        if (AUTH.length == 0 || AUTH == undefined) {
            await bird.login();
        } else {
            bird.setAccessToken(AUTH);
        }

        // now that we have the token, we can request scooters
        let birds = await bird.getScootersNearby(ASU_LONG, ASU_LAT, SCOOT_RANGE_MI);

        // bird details
        let details = await bird.getScooterDetails(birds[0].id)

        // log results to the console
        console.log(details);

    } catch (err) {
        console.log(err)
    }
}

init();