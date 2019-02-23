class Util {

    /**
     * Gets the current datetime and returns it as a string
     * @returns {string} Datetime in yyyymmddThhmmss format; ex: 20190103T083000 = January 3, 2019 8:30am
     */
    static getTimeNowString() {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;

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
     * @returns {string} Datetime in yyyymmddThhmmss format; ex: 20190103T083000 = January 3, 2019 8:30am
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
     * @returns {string} Datetime in yyyymmddThhmmss format; ex: 20190103T083000 = January 3, 2019 8:30am
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
     * Converts the yyyymmddThhmmss back into a Date object
     * @param {string} timeStampID 
     * @returns {Date} Date object
     */
    static convertTimeStampIDToDate(timeStampID) {
        let dateToReturn = new Date(),
            year = timeStampID.substr(0, 4),
            month = timeStampID.substr(4, 2),
            day = timeStampID.substr(6, 2),
            hours = timeStampID.substr(9, 2),
            minutes = timeStampID.substr(11, 2),
            seconds = timeStampID.substr(13, 2);
        
        dateToReturn.setUTCFullYear(year, month - 1, day);
        dateToReturn.setUTCHours(hours, minutes, seconds);

        return dateToReturn;
    }
}