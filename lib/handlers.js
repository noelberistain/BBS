/* eslint-disable standard/no-callback-literal */
/* eslint-disable indent */
/*
* Request handlers
*
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define our handlers
const handlers = {}

// Users
handlers.users = function (data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback)
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
    // Check for all required fields are filled out
    // var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const firstName = checkString(data.payload.firstName)
    // var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const lastName = checkString(data.payload.lastName)
    // var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const phone = checkPhone(data.payload.phone)
    // var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const password = checkString(data.payload.password)
    // var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    const tosAgreement = agree(data.payload.tosAgreement)

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesnt already exist

        _data.read('users', phone, function (err, data) {
            if (err) {
                // Hash the password (bcrypt)
                const hashedPassword = helpers.hash(password)

                // Create the user object
                if (hashedPassword) {
                    const userObj = {
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone,
                        hashedPassword: hashedPassword,
                        tosAgreement: true
                    }

                    // Store user
                    _data.create('users', phone, userObj, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, { Error: 'Could not create the new user' })
                        }
                    })
                } else {
                    callback(500, { Error: 'Could not hash the users password' })
                }
            } else {
                // If user already exist
                callback(400, { Error: 'User with this phone number already exist' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required fields' })
    }
}

// Users-get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone elses
handlers._users.get = function (data, callback) {
    // Check for the phone, as a valid param
    const phone = checkPhone(data.queryStringObject.phone)
    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err) {
                // Remove the hashed password from the user object before returning it to the request
                delete data.hashedPassword
                callback(200, data)
            } else {
                callback(400)
            }
        })
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}

// Users-put
// Req data : phone
// Opt data : anything else
// @TODO only let an authenticated user update their own object. Not anyone else
handlers._users.put = function (data, callback) {
    // Check for the required field
    const phone = checkPhone(data.payload.phone)
    const firstName = checkString(data.payload.firstName)
    const lastName = checkString(data.payload.lastName)
    const password = checkString(data.payload.password)

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // Loockup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    // Update the fields neccesary
                    if (firstName) {
                        userData.firstName = firstName
                    }
                    if (lastName) {
                        userData.lastName = lastName
                    }
                    if (password) {
                        userData.password = helpers.hash(password)
                    }
                    // Store the new Data
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, { Error: 'Could not update the user' })
                        }
                    })
                } else {
                    callback(400, { Error: 'The specified user does not exist' })
                }
            })
        } else {
            callback(400, { Error: 'Missing fields to update' })
        }
    } else {
        callback(400, { Error: 'Missign required field' })
    }
}

// Users-delete
// Required field: phone
// @TODO only the authenticated user delete their data
// @TODO cleanup any other data files associated with him
handlers._users.delete = function (data, callback) {
    // Check that the phone is valid
    const phone = checkPhone(data.queryStringObject.phone)
    if (phone) {
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                // Remove the hashed password from the user object before returning it to the request
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { Error: 'Could not delete the specified user' })
                    }
                })
            } else {
                callback(400, { Error: 'Could not find the specified user' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}

function checkString (string) {
    if (typeof string === 'string' && string.trim().length > 0) {
        return string.trim()
    } else {
        return false
    }
}
function checkPhone (number) {
    if (typeof number === 'string' && number.length === 10) {
        return number
    } else return false
}
function agree (bool) {
    if (bool === 'boolean' && bool === 'true') return true
    else return false
}

// Ping handle
handlers.ping = function (data, callback) {
    callback(200)
}

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404)
}

module.exports = handlers
