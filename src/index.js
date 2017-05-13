'use strict';

// External imports
const Alexa = require('alexa-sdk');

// Local imports
const Handlers = require('./Handlers');

// Constants
const APP_ID = "amzn1.ask.skill.437c7a75-b75f-4ffd-83d7-c78bbfa912c2"; // This value would be your Skill ID. You can find this on https://developer.amazon.com/

exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context);

    alexa.appId = APP_ID;
    alexa.registerHandlers(Handlers);

    console.log(`Beginning execution for skill with APP_ID=${alexa.appId}`);
    alexa.execute();
    console.log(`Ending execution  for skill with APP_ID=${alexa.appId}`);
};