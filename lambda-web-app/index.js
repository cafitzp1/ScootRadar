const AWS = require("aws-sdk");
const Util = require('./lib/util');
const Bird = require('./lib/bird');
const bird = new Bird();

const ASU_LAT = 33.4187;
const ASU_LONG = -111.9347;
const RADIUS = 1;
const REGION = "us-west-2";
const ENDPOINT = "https://dynamodb.us-west-2.amazonaws.com";
const TZ_OFFSET = 25200; // 7 hours in seconds

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

async function getDataFromDB(date) {
    return new Promise(async (resolve, reject) => {
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
            let startEpoch = Math.floor(day.setHours(0, 0, 0, 0) / 1000),
                endEpoch = Math.floor(day.setHours(23, 59, 59, 999) / 1000);

            // times needs to be shifted 7 hours over in seconds (GMT to AZ time);
            startEpoch += TZ_OFFSET, endEpoch += TZ_OFFSET;
            console.log('Getting records between ' + startEpoch + ' and ' + endEpoch);

            // table attributes: recordID (primary key), record (our item data), dateCreated, and ttl
            // dateCreated gets stored in epoch, so we want all records between start and end
            // if scan is too large, LastEvaluatedKey will hold data for last item retreived
            let lastEvaluatedKey = null;
            let items = [];
            let count = 0;
            let scannedCount = 0;

            // loop while there is a lastEvaluatedKey
            do {
                let params = {
                    TableName: "Records",
                    FilterExpression: "#dateCreated between :fromEpoch and :toEpoch",
                    ExpressionAttributeNames: {
                        '#dateCreated': 'dateCreated',
                    },
                    ExpressionAttributeValues: {
                        ':fromEpoch': startEpoch,
                        ':toEpoch': endEpoch,
                    },
                    ExclusiveStartKey: lastEvaluatedKey
                };

                // get data from db scan method
                let data = await dynamoDBScan(docClient, params);

                // set data for local variables
                count += data.Count;
                scannedCount += data.ScannedCount;
                lastEvaluatedKey = data.LastEvaluatedKey;
                data.Items.forEach((record) => {
                    console.log("-", record.recordID + ": " + record.dateCreated);
                    items.push(record);
                });

            } while (lastEvaluatedKey != null);

            // construct new data object
            let data = {
                Count: count,
                Items: items,
                ScannedCount: scannedCount
            }

            // resolve
            let response = Util.generateResponse(200, data);
            resolve(response);
        } catch (error) {
            reject(error);
        }
    });
}

function dynamoDBScan(docClient, params) {
    return new Promise((resolve, reject) => {

        docClient.scan(params, (err, data) => {
            if (err) {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject(response);
            } else {
                console.log("Query succeeded");
                resolve(data);
            }
        });
    });
}

// ----- FOR TESTING ----- //

async function test() {
    let data = await getDataFromDB("2019-02-18T08:09:32+00:00");
    console.log(data);
}

if (process.env.config == 'debug') {
    test();
}