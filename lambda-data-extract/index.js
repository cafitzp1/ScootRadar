const AWS = require("aws-sdk");
const Util = require('./lib/util');
const Bird = require('./lib/bird');
const bird = new Bird();

const ASU_LAT = 33.4187;
const ASU_LONG = -111.9347;
const RADIUS = 1;
const REGION = "us-west-2";
const ENDPOINT = "https://dynamodb.us-west-2.amazonaws.com";
const MONTH_S = 2592000;

exports.handler = async (event) => {
    try {
        AWS.config.update({
            region: REGION,
            endpoint: ENDPOINT
        });

        await bird.login();
        let scoots = await bird.getScootersNearby(ASU_LAT, ASU_LONG, RADIUS);

        // send data to the db
        putData(scoots);
    } catch (error) {
        console.error(error);
    }
};

function putData(birdData) {
    return new Promise((resolve, reject) => {
        console.log("Importing into DynamoDB.");

        let docClient = new AWS.DynamoDB.DocumentClient(),
            timeString = Util.getTimeNowString(),
            timeNowEpoch = (new Date).getTime();

        // attributes: primary key, item data, created, and ttl
        let params = {
            TableName: "Records",
            Item: {
                "recordID": timeString,
                "record": birdData,
                "dateCreated": timeNowEpoch,
                "ttl": Date.now() + MONTH_S
            }
        };

        docClient.put(params, (err, data) => {
            if (err) {
                reject(console.error("Unable to add", params.Item.recordID, ". Error JSON:", JSON.stringify(err, null, 2)));
            } else {
                resolve(console.log("PutItem succeeded:", params.Item.recordID));
            }
        });
    });
}

// ----- FOR TESTING ----- //

async function test() {
    exports.handler(null);
}

if (process.env.config == 'debug') {
    test();
}