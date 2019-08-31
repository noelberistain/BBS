/*
 *Primary file for the API
 *
 */

const http = require('http')
const https = require('https')
const url = require('url')
const { StringDecoder } = require('string_decoder')
const config = require('./lib/config')
// const _data = require('./lib/data')
const fs = require('fs')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')

// // TESTING
// // @TODO delete this
// _data.delete('users', 'newFile', function (err) {
//     console.log('this was the error', err);
// });

// The server should respond to all requests with a string
const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res)
})

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
    console.log(
        `server working on port ${config.httpPort} in ${config.envName} mode`
    )
})

// Instantiate the HTTPS server
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
}

// Instantiate the HTTPS server
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res)
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
    console.log(
        `server working on port ${config.httpsPort} in ${config.envName} mode`
    )
})

// All the server logic for both the http and https server
const unifiedServer = function(req, res) {
    // Get the url nad parse it
    const parseUrl = url.parse(req.url, true)
    // Getting the path form the url
    const path = parseUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // Get the query string as an object
    const queryString = parseUrl.query

    // Get the headers as an object
    const headers = req.headers

    // Get the HTTP method
    const method = req.method.toLowerCase()

    // Get the payload if there is any
    const decoder = new StringDecoder('utf-8')
    var buffer = ''
    req.on('data', function(data) {
        buffer += decoder.write(data)
    })

    req.on('end', function() {
        buffer += decoder.end()

        // Choose the handler this request should go to. If one is not found use 'notFound' handler
        var chosenHandler =
            typeof router[trimmedPath] !== 'undefined'
                ? router[trimmedPath]
                : handlers.notFound

        // Construct the data object to send to the handler
        var data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryString,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        }

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // Use the status code called by the handler, or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200
            // Use the payload called back by the handler, or default to an empty object
            payload = typeof payload === 'object' ? payload : {}
            // Convert the payload to a string
            var payloadString = JSON.stringify(payload)

            // Return response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)

            // Log the request path
            console.log(
                `Returning this reponse: ${statusCode} & ${payloadString}`
            )
        })
    })
}

// Define a request router
var router = {
    ping: handlers.ping,
    users: handlers.users
}
