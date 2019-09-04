var environments = {}

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    secret: 'matangadijolachanga',
    maxChecks: 5
}
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    secret: 'matangadijolaotrachanga',
    maxChecks: 5
}

var currentEnv =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLowerCase()
        : ''

var environmentToExport =
    typeof environments[currentEnv] == 'object'
        ? environments[currentEnv]
        : environments.staging

module.exports = environmentToExport
