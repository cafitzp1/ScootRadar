const AWS = require("aws-sdk");
const Util = require('./lib/util');
const Bird = require('./lib/bird');
const bird = new Bird();

const ASU_LAT = 33.4187;
const ASU_LONG = -111.9347;
const RADIUS = 1;
const REGION = "us-west-2";
const ENDPOINT = "https://dynamodb.us-west-2.amazonaws.com";

// this is the method that begins our code
exports.handler = async (event) => {
    try {
        console.log(event);

        // if there are parameters, we need to check for a date
        if (event != null && event.queryStringParameters) {
            // if there is a date, we want to access the database
            if (event.queryStringParameters.date) {
                let date = event.queryStringParameters.date;
                let response = await getDataFromDB(date);
                return response;
            }
        } else {
            // if no date is passed, we get live data as normal
            let response = await getLiveData();
            return response;
        }

    } catch (error) {
        let response = Util.generateResponse(400, error);
        console.error(error);

        return response;
    }
};

async function getLiveData() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Getting live data');

            // login has to occur first, we get authentication token we need for next step
            await bird.login();
            // with authentication token, we can request scooters nearby
            let scoots = await bird.getScootersNearby(ASU_LAT, ASU_LONG, RADIUS);
            // now with the returned scooter data, we format a response for our API
            let response = Util.generateResponse(200, scoots);
            // response object returns scooter data to the web page

            console.log('Get live data succeeded');
            resolve(response);
        } catch (error) {
            reject(error);
        }
    });
}

function getDataFromDB(date) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Querying DynamoDB');

            // configure DynamoDB endpoint
            AWS.config.update({
                region: REGION,
                endpoint: ENDPOINT
            });

            // initialize client and store day from date paramater
            let docClient = new AWS.DynamoDB.DocumentClient();
            let day = new Date(Date.parse(date));

            // store beginning and end of the day (records before 0600 will be null)
            let startEpoch = day.setHours(6, 0, 0, 0),
                endEpoch = day.setHours(23, 59, 59, 999);

            startEpoch = Math.floor(startEpoch / 1000), endEpoch = Math.floor(endEpoch / 1000);

            // start and end will be GMT, this is fine as that's how it's stored in our Records table

            // table attributes: recordID (primary key), record (our item data), dateCreated, and ttl
            // dateCreated gets stored in epoch, so we want all records between start and end
            let params = {
                TableName: "Records",
                FilterExpression: "#dateCreated between :fromEpoch and :toEpoch",
                ExpressionAttributeNames: {
                    '#dateCreated': 'dateCreated',
                },
                ExpressionAttributeValues: {
                    ':fromEpoch': startEpoch,
                    ':toEpoch': endEpoch,
                }
            };

            // query
            docClient.scan(params, (err, data) => {
                if (err) {
                    console.log("Unable to query. Error:", JSON.stringify(err, null, 2));

                    reject(response);
                } else {
                    console.log("Query succeeded");
                    data.Items.forEach((record) => {
                        console.log(" -", record.recordID + ": " + record.dateCreated);
                    });

                    let response = Util.generateResponse(200, data)
                    resolve(response);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// ----- FOR TESTING ----- //

async function test() {
    let data = await getDataFromDB('2019-02-18T06:34:03.492+0000');
    console.log(data);
}

if (process.env.config == 'debug') {
    test();
}