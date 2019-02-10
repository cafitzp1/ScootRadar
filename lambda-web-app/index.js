"use strict";

const faker = require('faker');
const request = require('request');

const ASU_LAT = 33.4166061;
const ASU_LONG = -111.9363706;
const RADIUS = 1;

const baseURL = 'https://api.bird.com'
const deviceID = faker.random.uuid();
const platform = 'ios';
const appVersion = '3.0.5';
const authorization = '';

const headers = {
    'Device-id': faker.random.uuid(),
    'Platform': 'ios',
    'App-Version': '3.0.5',
    'Authorization': ''
}

// this is the method that begins our code
exports.handler = async (event) => {
    try {
        // async/await means methods will invoke in sequence

        // login has to occur first, we get authentication token we need for next step
        await login();

        // with authentication token, we can request scooters nearby
        let scoots = await getScootersNearby();

        // now with the returned scooter data, we format a response for the API
        let response = await generateResponse(200, scoots);

        // response returns scooter data to the web page, scoot data in response.body
        return response;
    } catch (error) {
        // there was a problem somewhere, so we return a bad response
        let response = await generateResponse(200, scoots);

        console.error(error);
    }
};

function login(email = faker.internet.email()) {
    return new Promise(function (resolve, reject) {
        request.post({
            url: 'https://api.bird.co/user/login',
            json: {
                email: email
            },
            headers: {
                'Device-id': `${headers["Device-id"]}`,
                'Platform': `${headers["Platform"]}`,
                'Content-type': 'application/json'
            },
            method: 'POST'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(setAccessToken(response.body.token));
            } else {
                reject(error);
            }
        });
    });
}

function setAccessToken(accessToken) {
    headers['Authorization'] = ''
    delete headers['Authorization']

    headers['Authorization'] = `Bird ${accessToken}`
}

function getScootersNearby(latitude = ASU_LAT, longitude = ASU_LONG, radius = RADIUS) {
    return new Promise(function (resolve, reject) {
        let options = {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': headers['Authorization'],
                'Device-id': headers["Device-id"],
                'Platform': headers["Platform"],
                'App-Version': headers["App-Version"],
                'Location': `{"latitude":${latitude},"longitude":${longitude},"altitude":500,"accuracy":100,"speed":-1,"heading":-1}`
            },
            method: 'GET',
            url: `https://api.bird.co/bird/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
            params: {
                latitude: latitude,
                longitude: longitude,
                radius: radius
            },
            responseType: 'json'
        };

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

function generateResponse(status, content) {
    return new Promise(function (resolve, reject) {
        // response statusCode and headers are required everytime
        let response = {
            statusCode: status,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify(content),
        };

        resolve(response);
    });
}

// ----- FOR TESTING ----- //
// `test` function will only be called while running 
// the `lambda-web-app (test)` debug configuration

async function test() {
    try {
        await login();

        let scoots = await getScootersNearby();
        let response = await generateResponse(200, scoots);

        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

if (process.env.config == 'debug') {
    test();
}