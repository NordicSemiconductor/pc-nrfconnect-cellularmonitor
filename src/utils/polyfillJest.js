/* eslint-disable no-undef */
if (
    typeof globalThis.TextEncoder === 'undefined' ||
    typeof globalThis.TextDecoder === 'undefined'
) {
    // eslint-disable-next-line global-require
    const utils = require('util');
    globalThis.TextEncoder = utils.TextEncoder;
    globalThis.TextDecoder = utils.TextDecoder;
}
