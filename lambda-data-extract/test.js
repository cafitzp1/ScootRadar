const AWS = require("aws-sdk");
const fs = require('fs');

const ARTIST_1 = "Radiohead";
const ARTIST_2 = "Portishead";

// this is the code that will get executed
{
    AWS.config.update({
        region: "us-west-2",
        endpoint: "https://dynamodb.us-west-2.amazonaws.com"
    });

    // putData();
    getData();
    // clearData();
}

// these are just method declarations
function putData() {
    console.log("Importing music into DynamoDB. Please wait.");

    const docClient = new AWS.DynamoDB.DocumentClient();
    const music = JSON.parse(fs.readFileSync('./lambda-data-extract/sample_data/music.json', 'utf8'));

    music.forEach(function (record) {
        
        let params = {
            TableName: "Music",
            Item: {
                "Artist": record.Artist,
                "Albums": record.Albums
            }
        };

        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add", record.Artist, ". Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("PutItem succeeded:", record.Artist);
            }
        });
    });
}

function getData(primaryKey) {
    console.log("Reading data from DynamoDB. Please wait.");

    const docClient = new AWS.DynamoDB.DocumentClient();

    let table = "Music",
        artist = primaryKey;

    // always need to specify the table name and primary key
    let params = {
        TableName: table,
        Key: {
            "Artist": artist
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

function getAllData() {
    getData(ARTIST_1);
    getData(ARTIST_2);
}

function deleteData(primaryKey) {
    console.log("Deleting data from DynamoDB. Please wait.");

    const docClient = new AWS.DynamoDB.DocumentClient();

    let table = "Music",
        artist = primaryKey;

    let params = {
        TableName: table,
        Key: {
            "Artist": artist
        }
    };

    docClient.delete(params, function (err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

function deleteAllData() {
    deleteData(ARTIST_1);
    deleteData(ARTIST_2);
}

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html