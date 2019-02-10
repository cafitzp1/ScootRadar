const faker = require('faker');
const request = require('request');

class Bird {

    constructor() {
        this.baseURL = 'https://api.bird.co/';
        this.deviceID = faker.random.uuid();
        this.platform = 'ios';
        this.appVersion = '3.0.5';
        this.authorization = '';
        this.contentType = 'application/json';
        this.accept = 'application/json, text/plain, */*'
    }

    /**
     * Login to generate an authentication token
     * @param {*} email Email to provide (optional)
     */
    login(email = faker.internet.email()) {
        return new Promise((resolve, reject) => {
            request.post({
                url: this.baseURL + 'user/login',
                json: {
                    email: email
                },
                headers: {
                    'Device-id': this.deviceID,
                    'Platform': this.platform,
                    'Content-type': this.contentType
                },
                method: 'POST'
            }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(this.authorization = response.body.token);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Request scooters within a specified radius of a particular XY coordinate
     * @param {*} latitude Latitude coordinate
     * @param {*} longitude Longitude coordinate
     * @param {*} radius Radius in miles
     */
    getScootersNearby(latitude, longitude, radius) {
        return new Promise((resolve, reject) => {
            let options = {
                headers: {
                    'Accept': this.accept,
                    'Authorization': this.authorization,
                    'Device-id': this.deviceID,
                    'Platform': this.platform,
                    'App-Version': this.appVersion,
                    'Location': `{
                        "latitude":${latitude},
                        "longitude":${longitude},
                        "altitude":500,
                        "accuracy":100,
                        "speed":-1,
                        "heading":-1
                    }`
                },
                method: 'GET',
                url: this.baseURL + 
                    'bird/nearby' + 
                    `?latitude=${latitude}` +
                    `&longitude=${longitude}` + 
                    `&radius=${radius}`,
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
}

module.exports = Bird