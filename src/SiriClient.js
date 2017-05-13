'use strict';

const Https = require('https');

class SiriClient {

    constructor() {
        console.log("Creating SiriClient instance.");
    }

    getTime() {
        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(fulfill, reject);
        });
    }

    __handleDeviceAddressApiRequest(fulfill, reject) {

        Https.get('https://bustime.mta.info/api/siri/stop-monitoring.json?key=TEST&OperatorRef=MTA&MonitoringRef=307674&LineRef=MTA%20NYCT_B52', function (response) {
            console.log(`Siri responded with a status code of : ${response.statusCode}`);

            response.on('data', function (data) {
                let responsePayloadObject = JSON.stringify(data);

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
