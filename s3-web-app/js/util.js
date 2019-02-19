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
     * Converts datetime into a string
     * @param {datetime} datetime Datetime to convert
     * @returns {string} Datetime in yyyymmddThhmm format; ex: 20190103T0830 = January 3, 2019 8:30am
     */
    static getTimeString(datetime) {

        return (
            new Date(datetime).toISOString()
            .replace(/-/g, '')
            .replace(/:/g, '')
            .replace(/\..+/, '')
        );
    }

    /**
     * Converts 12 hour time into 24 hour format
     * @param {datetime} time12h Time to convert
     * @returns {datetime} Time in 24 hour format
     */
    static convertTime12to24(time12h) {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':');

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }

        return hours + ':' + minutes;
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