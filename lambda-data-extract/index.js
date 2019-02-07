"use strict";

const Bird = require('node-bird')
const bird = new Bird()

const SCOOT_RANGE_MI = 0.01;
const SCOOT_INTERVAL_MS = 600000; // 10 min
const ASU_LONG = 33.4166061;
const ASU_LAT = -111.9363706;

async function init() {
    try {
        // wait for successful login, token is stored to bird object
        await bird.login();

        // now that we have the token, we can request scooters
        let scoots = await bird.getScootersNearby(ASU_LONG, ASU_LAT, SCOOT_RANGE_MI);

        // we will now log some scooters to the console
        console.log(`${scoots.length} scooters returned`)
        for (let i = 0; i < 5; i++) {
            console.log(scoots[i]);
        }
        console.log(`... ${scoots.length - 5} more`);

    } catch (err) {
        console.log(err)
    }
}

init();