const http = require('http');
const https = require('https');
const app = require('./app');



const httpPort = process.env.PORT || 80;
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort, () => {
        console.log("HTTP API Started on port: " + httpPort)
    });