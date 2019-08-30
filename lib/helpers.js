const crypto = require('crypto')
const config = require('./config')

let helpers = {}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (string) {
    try {
        // let obj = JSON.parse(str);
        let obj = JSON.parse(string);
        return obj;
    } catch{
        return {};
    }
}

// Create the SHA256 hash
helpers.hash = function (string) {
    if (typeof string == 'string' && string.length > 0) {
        // Hash the value
        const hash = crypto.createHmac('sha256', config.secret).update(string).digest('hex')
        return hash
    } else {
        return false
    }
};


module.exports = helpers