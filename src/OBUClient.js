'use strict';

const Https = require('https');

class OBUClient {

    constructor(apiEndpoint) {
        console.log("Creating OBUClient instance.");
        //this.endpoint = apiEndpoint.replace(/^https?:\/\//i, "");
        this.endpoint = 'https://bustime.mta.info/api/siri/stop-monitoring.json?key=TEST&OperatorRef=MTA&MonitoringRef=307674&LineRef=MTA%20NYCT_B52';
    }

    getStopId() {
        const options = this.__getRequestOptions();

        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(options, fulfill, reject);
        });
    }

    __handleDeviceAddressApiRequest(requestOptions, fulfill, reject) {

        Https.get('https://bustime.mta.info/api/where/stops-for-location.json?key=TEST&lat=40.685168&lon=-73.956191&radius=100', function (response) {
            console.log(`OBU responded with a status code of : ${response.statusCode}`);

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

    __getRequestOptions() {
        return {
            url: this.apiEndpoint,
            method: 'GET'
        };
    }
}

module.exports = OBUClient;
