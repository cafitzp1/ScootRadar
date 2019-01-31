"use strict";

const Bird = require('node-bird')
const bird = new Bird()
const prompt = require("prompt-async");

const SCOOT_RANGE_MI = 1;
const SCOOT_INTERVAL_MS = 600000; // 10 min
const ASU_LONG = 33.4166061;
const ASU_LAT = -111.9363706;

async function init() {
    try {
        await bird.login('fitz00000@gmail.com')
        prompt.start();
        const {
            verifyCode
        } = await prompt.get(['verifyCode']);
        await bird.verifyEmail(verifyCode);
        getScoots();
    } catch (err) {
        console.log(err)
    }
}

async function getScoots() {
    let scoots = await bird.getScootersNearby(ASU_LONG, ASU_LAT, SCOOT_RANGE_MI);
    console.log(scoots);
}

init();