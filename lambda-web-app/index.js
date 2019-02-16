const Bird = require('./lib/bird');
const bird = new Bird();

const ASU_LAT = 33.4187;
const ASU_LONG = -111.9347;
const RADIUS = 1;

// this is the method that begins our code
exports.handler = async (event) => {
    try {
        console.log(event);

        // login has to occur first, we get authentication token we need for next step
        await bird.login();
        // with authentication token, we can request scooters nearby
        let scoots = await bird.getScootersNearby(ASU_LAT, ASU_LONG, RADIUS);
        // now with the returned scooter data, we format a response for our API
        let response = await generateResponse(200, scoots);
        // response object returns scooter data to the web page
        return response;
    } catch (error) {
        let response = await generateResponse(400, error);
        console.error(error);
    }
};

function getDataFromDB(date) {
    // implement functionality to read data from the db
}

function generateResponse(status, content) {
    return new Promise((resolve, reject) => {
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

async function test() {
    try {
        await bird.login();
        let scoots = await bird.getScootersNearby(ASU_LAT, ASU_LONG, RADIUS);
        let response = await generateResponse(200, scoots);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

if (process.env.config == 'debug') {
    test();
}