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

exports.handler = async (event, context) => {
    try {
        // configure DynamoDB endpoint
        AWS.config.update({
            region: REGION,
            endpoint: ENDPOINT
        });

        // get scooter data
        console.log("Getting data from Bird API");
        await bird.login();
        let scoots = await bird.getScootersNearby(ASU_LAT, ASU_LONG, RADIUS);

        // send data to the db
        await putData(scoots);
        context.done();

    } catch (error) {
        console.error(error);
        context.fail();
    }
};

function putData(data, context) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Importing into DynamoDB");

            // initialize client, generate recordID and dateCreated values
            let docClient = new AWS.DynamoDB.DocumentClient(),
                timeString = Util.getTimeNowString(),
                timeNowEpoch = Math.floor((new Date).getTime() / 1000);

            // table attributes: recordID (primary key), record (our item data), dateCreated, and ttl
            let params = {
                TableName: "Records",
                Item: {
                    "recordID": timeString,
                    "record": data,
                    "dateCreated": timeNowEpoch,
                    "ttl": timeNowEpoch + MONTH_S
                }
            };

            // put data
            docClient.put(params, (err, data) => {
                if (err) {
                    reject(console.error("Unable to add", params.Item.recordID, ". Error JSON:", JSON.stringify(err, null, 2)));
                } else {
                    resolve(console.log("PutItem succeeded:", params.Item.recordID));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// ----- FOR TESTING ----- //

async function test() {
    exports.handler(null);
}

if (process.env.config == 'debug') {
    test();
}

/* query examples:
    # count of items in DB
    $ aws dynamodb scan --table-name Records --select COUNT

    # items with only the "recordID" and "dateCreated" attributes
    $ aws dynamodb scan --table-name Records --projection-expression "recordID, dateCreated"

    # all item data
    $ aws dynamodb scan --table-name Records
*/