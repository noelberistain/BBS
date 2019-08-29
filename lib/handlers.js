/*
* Request handlers
*
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define our handlers
const handlers = {};

// Users
handlers.users = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405)
    }
}

// Container for the users submethods
handlers._users = {}

// Users-post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
    //Check for all required fields are filled out
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    console.log("INPUT = =")
    console.log(data)
    if (firstName && lastName && phone && password && tosAgreement) {
        //Make sure that the user doesnt already exist

        _data.read('users', phone, function (err, data) {
            if (err) {
                // Hash the password (bcrypt)
                const hashPassword = helpers.hash(password)
                if (hashPassword) {

                    // Create the user object
                    const userObj = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        tosAgreement: true
                    }

                    // Store user
                    _data.create('users', phone, userObj, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, { 'Error': 'Could not create the new user' })
                        }
                    })
                } else {
                    callback(500, { 'Error': 'Could not hash the users password' })
                }

            } else {
                // If user already exist
                callback(400, { 'Error': 'User with this phone number already exist' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}


// Users-get
handlers._users.get = function (data, callback) {

}

// Users-put
handlers._users.put = function (data, callback) {

}

// Users-delete
handlers._users.delete = function (data, callback) {

}


function checkString(string) {
    if (typeof string == 'string' && string.trim().length > 0) {
        return string.trim()
    } else {
        return false
    }
}
function checkPhone(number) {
    if (typeof number == 'string' && number.length == 10)
        return number
    else return false
}
function agree(bool) {
    if (bool == 'boolean' && bool == 'true') return true
    else return false
}

// Ping handle
handlers.ping = function (data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};


module.exports = handlers