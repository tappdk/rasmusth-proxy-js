var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');

var privateKey = fs.readFileSync('/Users/rasmusth/Documents/Certificates/*.rasmusth.dk_key.pem', 'utf8');
var certificate = fs.readFileSync('/Users/rasmusth/Documents/Certificates/*.rasmusth.dk_cert.pem', 'utf8');
var ssl = {
    key: privateKey,
    cert: certificate
};

var proxyStaticFiles = new httpProxy.createProxyServer({
    ssl: ssl,
    secure: true,
    target: 'https://local.rasmusth.dk:20900'
});

var proxyTransmission = new httpProxy.createProxyServer({
    target: 'http://192.168.1.123:9091'
});

var proxyPlex = new httpProxy.createProxyServer({
    target: 'http://localhost:32400'
});

var handler = function (req, res) {
    console.log('Host: ' + req.headers.host);
    var errorHandler = function(err, req, res) {
        if (err) console.log(err);
        res.writeHead(500);
        res.end('Oops, something went very wrong...');
    };
    if (req.headers.host === 'static-files.rasmusth.dk') {
        proxyStaticFiles.proxyRequest(req, res);
        proxyStaticFiles.on('error', errorHandler);
    } else if (req.headers.host === 'transmission.rasmusth.dk') {
        proxyTransmission.proxyRequest(req, res);
        proxyTransmission.on('error', errorHandler);
    } else if (req.headers.host === 'plex.rasmusth.dk') {
        proxyPlex.proxyRequest(req, res);
        proxyPlex.on('error', errorHandler());
    }
};

var server = https.createServer(ssl);
server.addListener('request', handler);
server.listen(443);

var redirectionHandler = function (req, res) {
    res.writeHead(302, {
        'Location': 'https://' + req.headers.host
    });
    res.end();
};

var redirectionServer = http.createServer();
redirectionServer.addListener('request', redirectionHandler);
redirectionServer.listen(80)
