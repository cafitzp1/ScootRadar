class Util {

    /**
     * Gets the current datetime and returns it as a string
     * @returns {string} Datetime in yyyymmddThhmm format; ex: 20190103T0830 = January 3, 2019 8:30am
     */
    static getTimeNowString() {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000

        return (
            new Date(Date.now() - tzoffset).toISOString()
            .replace(/-/g, '')
            .replace(/:/g, '')
            .replace(/\..+/, '')
        );
    }

    /**
     * Converts epoch time format (unix time stamp) into datetime as a string
     * @param {*} epoch Time since the epoch (unix time stamp)
     * @returns {string} Datetime in yyyymmddThhmm format; ex: 20190103T0830 = January 3, 2019 8:30am
     */
    static epochToLocalTime(epoch) {
        let utcSeconds = epoch;
        let date = new Date(0); // 0 sets date to the actual epoch
        date.setUTCSeconds(utcSeconds);

        return (
            date.toISOString()
            .replace(/-/g, '')
            .replace(/:/g, '')
            .replace(/\..+/, '')
        );
    }

    /**
     * Generates a response object for AWS Lambda
     * @param {*} status Status code
     * @param {*} content Data to send back in the response body
     */
    static generateResponse(status, content) {
        return new Promise((resolve, reject) => {
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
}

module.exports = Util;