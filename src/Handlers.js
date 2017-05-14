'use strict';


// Internal imports
const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
const OBUClient = require('./OBUClient');
const SiriClient = require('./SiriClient');


const Intents = require('./Intents');
const Events = require('./Events');
const Messages = require('./Messages');

/**
 * Another Possible value if you only want permissions for the country and postal code is:
 * read::alexa:device:all:address:country_and_postal_code
 * Be sure to check your permissions settings for your skill on https://developer.amazon.com/
 */
const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";

const PERMISSIONS = [ALL_ADDRESS_PERMISSION];

/**
 * This is the handler for the NewSession event.
 * Refer to the  Events.js file for more documentation.
 */
const newSessionRequestHandler = function () {
    console.info("Starting newSessionRequestHandler()");

    if (this.event.request.type === Events.LAUNCH_REQUEST) {
        this.emit(Events.LAUNCH_REQUEST);
    } else if (this.event.request.type === "IntentRequest") {
        this.emit(this.event.request.intent.name);
    }

    console.info("Ending newSessionRequestHandler()");
};

/**
 * This is the handler for the LaunchRequest event. Refer to
 * the Events.js file for more documentation.
 */
const launchRequestHandler = function () {
    console.info("Starting launchRequestHandler()");
    this.emit(":ask", Messages.WELCOME + Messages.WHAT_DO_YOU_WANT, Messages.WHAT_DO_YOU_WANT);
    console.info("Ending launchRequestHandler()");
};

/**
 * This is the handler for our custom GetAddress intent.
 * Refer to the Intents.js file for documentation.
 */
const getAddressHandler = function () {
    console.info("Starting getAddressHandler()");

    const consentToken = this.event.context.System.user.permissions.consentToken;

    // If we have not been provided with a consent token, this means that the user has not
    // authorized your skill to access this information. In this case, you should prompt them
    // that you don't have permissions to retrieve their address.
    if (!consentToken) {
        this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);

        // Lets terminate early since we can't do anything else.
        console.log("User did not give us permissions to access their address.");
        console.info("Ending getAddressHandler()");
        return;
    }

    const deviceId = this.event.context.System.device.deviceId;
    const apiEndpoint = this.event.context.System.apiEndpoint;

    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();

    deviceAddressRequest.then((addressResponse) => {
        switch (addressResponse.statusCode) {
            case 200:
                console.log("Address successfully retrieved, now responding to user.");
                const address = addressResponse.address;

                const ADDRESS_MESSAGE = Messages.ADDRESS_AVAILABLE +
                    `${address['addressLine1']}, ${address['stateOrRegion']}, ${address['postalCode']}`;

                this.emit(":tell", ADDRESS_MESSAGE);
                break;
            case 204:
                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the device address API, but no address was returned.");
                this.emit(":tell", Messages.NO_ADDRESS);
                break;
            case 403:
                console.log("The consent token we had wasn't authorized to access the user's address.");
                this.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
                break;
            default:
                this.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
        }

        console.info("Ending getAddressHandler()");
    });

    deviceAddressRequest.catch((error) => {
        this.emit(":tell", Messages.ERROR);
        console.error(error);
        console.info("Ending getAddressHandler()");
    });
};


const getStopsNearby = function () {
    console.info("Starting getStopsNearby()");

    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY


    

    // 405 Franklin Lat, Long
    let lat = 40.685168;
    let long = -73.956191;

    const _OBUClient = new OBUClient();
    let promiseRequest = _OBUClient.getStopId();



    promiseRequest.then((response) => {
        switch (response.statusCode) {
            case 200:
                const data = response.message;
                console.log("OBU successfully retrieved, now responding to user.", data);

                var feedback = data.data.stops.map(function (stop) {
                    return 'the ' + stop.routes[0].shortName + ' in ' + stop.name.replace('/', ' and ') + '.';
                }).join(' or ');

                //data.data.stops[1].code

                this.emit(":ask", 'Your can take : ' + feedback);
                break;
            case 204:
                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the OBU, but not found");
                this.emit(":tell", 'There was an issue retrieving the information');
                break;
            default:
                this.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
        }

        console.info("Ending getStopsNearby()");
    });

    promiseRequest.catch((error) => {
        this.emit(":tell", Messages.ERROR);
        console.error(error);
        console.info("Ending getStopsNearby()");
    });
}


const getNextBusHandler = function () {
    console.info("Starting getNextBusHandler()");


    // 405 Franklin Lat, Long
    let lat = 40.685168;
    let long = -73.956191;

    const busId = this.event.request.intent.slots.bus.value;
    console.info('Bus id', busId);


    const _OBUClient = new OBUClient();
    let promiseRequest = _OBUClient.getStopId();

    promiseRequest.then((response) => {
        switch (response.statusCode) {
            case 200:

                const data = response.message;
                console.log("OBU successfully retrieved, now responding to user. Now looking for the next bus on that stop");

                var stopId = data.data.stops.filter(function (stop) {
                    return (stop.routes[0].shortName === 'B' + busId)
                })[0].code;


                if (!stopId) {
                    this.emit(":tell", 'There was an issue retrieving the information for that bus.');
                    return;
                }

                const _SiriClient = new SiriClient(busId, stopId);
                let promiseSiriRequest = _SiriClient.getTime();


                promiseSiriRequest
                    .then((response) => {

                        const siriData = response.message;

                        switch (response.statusCode) {
                            case 200:
                                //this.emit(":ask", 'Your next B52 bus is 6 miles away');
                                this.emit(":ask", `Your next B${busId} bus is: ${siriData.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance}`);
                                break;
                        }
                    }).catch((error) => {
                        this.emit(":tell", Messages.ERROR);
                        console.error(error);
                        console.info("Ending getNextBusHandler()");
                    });
                break;
            case 204:
                console.log("Successfully requested from the Siri, but not found");
                this.emit(":tell", 'There was an issue retrieving the information');
                break;
            default:
                this.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
        }

        console.info("Ending getNextBusHandler()");
    });

    promiseRequest.catch((error) => {
        this.emit(":tell", Messages.ERROR);
        console.error(error);
        console.info("Ending getNextBusHandler()");
    });

};




/**
 * This is the handler for the SessionEnded event. Refer to
 * the Events.js file for more documentation.
 */
const sessionEndedRequestHandler = function () {
    console.info("Starting sessionEndedRequestHandler()");
    this.emit(":tell", Messages.GOODBYE);
    console.info("Ending sessionEndedRequestHandler()");
};

/**
 * This is the handler for the Unhandled event. Refer to
 * the Events.js file for more documentation.
 */
const unhandledRequestHandler = function () {
    console.info("Starting unhandledRequestHandler()");
    this.emit(":ask", Messages.UNHANDLED, Messages.UNHANDLED);
    console.info("Ending unhandledRequestHandler()");
};

/**
 * This is the handler for the Amazon help built in intent.
 * Refer to the Intents.js file for documentation.
 */
const amazonHelpHandler = function () {
    console.info("Starting amazonHelpHandler()");
    this.emit(":ask", Messages.HELP, Messages.HELP);
    console.info("Ending amazonHelpHandler()");
};

/**
 * This is the handler for the Amazon cancel built in intent.
 * Refer to the Intents.js file for documentation.
 */
const amazonCancelHandler = function () {
    console.info("Starting amazonCancelHandler()");
    this.emit(":tell", Messages.GOODBYE);
    console.info("Ending amazonCancelHandler()");
};

/**
 * This is the handler for the Amazon stop built in intent.
 * Refer to the Intents.js file for documentation.
 */
const amazonStopHandler = function () {
    console.info("Starting amazonStopHandler()");
    this.emit(":ask", Messages.STOP, Messages.STOP);
    console.info("Ending amazonStopHandler()");
};


const handlers = {};
// Add event handlers
handlers[Events.NEW_SESSION] = newSessionRequestHandler;
handlers[Events.LAUNCH_REQUEST] = launchRequestHandler;
handlers[Events.SESSION_ENDED] = sessionEndedRequestHandler;
handlers[Events.UNHANDLED] = unhandledRequestHandler;

// Add intent handlers
handlers[Intents.GET_ADDRESS] = getAddressHandler;
handlers[Intents.GET_NEXTBUS] = getNextBusHandler; //Mauro
handlers[Intents.GET_STOPS_NEARBY] = getStopsNearby; //Mauro
handlers[Intents.AMAZON_CANCEL] = amazonCancelHandler;
handlers[Intents.AMAZON_STOP] = amazonStopHandler;
handlers[Intents.AMAZON_HELP] = amazonHelpHandler;

module.exports = handlers;