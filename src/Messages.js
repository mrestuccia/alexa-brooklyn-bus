'use strict';

/**
 * This file contains a map of messages used by the skill.
 */

const WELCOME = "Welcome to Brooklyn Bus Information";

const WHAT_DO_YOU_WANT = "What do you want to ask?";

const NOTIFY_MISSING_PERMISSIONS = "Please enable Location permissions in the Amazon Alexa app.";

const NO_ADDRESS = "It looks like you don't have an address set. You can set your address from the companion app.";

const ADDRESS_AVAILABLE = "Here is your full address: ";

const NEXT_BUS_ADDRESS_AVAIABLE = "The next bus for: ";

const ERROR = "Uh Oh. Looks like something went wrong.";

const LOCATION_FAILURE = "There was an error with the Device Address API. Please try again.";

const GOODBYE = "Good bye! I hope everybody is enjoying the Stackaton as I am.";

const UNHANDLED = "This skill doesn't support that. Please ask something else.";

const HELP = "You can use this skill by asking something like: tell me my nearby stops or, when is the next bus comming?";

const STOP = "There is nothing to stop. Did you mean to ask something else?";

module.exports = {
    "WELCOME": WELCOME,
    "WHAT_DO_YOU_WANT": WHAT_DO_YOU_WANT,
    "NOTIFY_MISSING_PERMISSIONS": NOTIFY_MISSING_PERMISSIONS,
    "NO_ADDRESS": NO_ADDRESS,
    "ADDRESS_AVAILABLE": ADDRESS_AVAILABLE,
    "NEXT_BUS_ADDRESS_AVAIABLE": NEXT_BUS_ADDRESS_AVAIABLE,
    "ERROR": ERROR,
    "LOCATION_FAILURE": LOCATION_FAILURE,
    "GOODBYE": GOODBYE,
    "UNHANDLED": UNHANDLED,
    "HELP": HELP,
    "STOP": STOP
};