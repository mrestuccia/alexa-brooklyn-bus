'use strict';

const Https = require('https');

class SiriClient {

    constructor(busId, stopId) {
        console.log("Creating SiriClient instance.");
        this.busId = 'MTA%20NYCT_B' + busId;
        this.stopId = stopId;
    }

    getTime() {
        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(fulfill, reject);
        });
    }

    __handleDeviceAddressApiRequest(fulfill, reject) {

        Https.get(`https://bustime.mta.info/api/siri/stop-monitoring.json?key=TEST&OperatorRef=MTA&MonitoringRef=${this.stopId}&LineRef=${this.busId}`, function (response) {
            console.log(`Siri responded with a status code of : ${response.statusCode}`);

            response.on('data', function (data) {
                let responsePayloadObject = JSON.parse(data);

                const deviceAddressResponse = {
                    statusCode: response.statusCode,
                    message: responsePayloadObject
                };

                fulfill(deviceAddressResponse);
            });
        }).on('error', function (e) {
            console.error(e);
            reject();
        });
    }
}

module.exports = SiriClient;
