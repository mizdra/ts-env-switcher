"use strict";
function isBrowser() {
    return 'window' in globalThis;
}
function isNodeJS() {
    return 'process' in globalThis;
}
function log(message) {
    /* switch: { "-types": ["node"] } */
    if (isBrowser()) {
        document.write(message);
    }
    /* switch: { "-lib": ["dom"] } */
    if (isNodeJS()) {
        document.write(message); // error
        // process.stdout.write(message);
    }
}
log('message');
