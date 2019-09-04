const crypto = require('crypto')
const config = require('./config')

let helpers = {}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(string) {
    try {
        // let obj = JSON.parse(str);
        let obj = JSON.parse(string)
        return obj
    } catch {
        return {}
    }
}

// Create the SHA256 hash
helpers.hash = function(string) {
    if (typeof string == 'string' && string.length > 0) {
        // Hash the value
        const hash = crypto
            .createHmac('sha256', config.secret)
            .update(string)
            .digest('hex')
        return hash
    } else {
        return false
    }
}

// Create a string of random alphanumeric characteres, of a given length
helpers.createRandomString = function(strlength) {
    strlength =
        typeof strlength === 'number' && strlength > 0 ? strlength : false
    if (strlength) {
        let possibleString = 'abcdefghijklmpqrstuwxyz0123456789'
        let str = ''
        for (let i = 0; i < strlength; i++) {
            str +=
                possibleString[
                    Math.floor(Math.random() * (possibleString.length - 1))
                ]
        }

        return str
    } else {
        return false
    }
}

module.exports = helpers
