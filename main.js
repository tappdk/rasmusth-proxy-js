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

var proxy_static_files = new httpProxy.createProxyServer({
    ssl: ssl,
    secure: true,
    target: 'https://local.rasmusth.dk:20900'
});

var proxy_transmission = new httpProxy.createProxyServer({
    target: 'http://192.168.1.123:9091'
});

var handler = function (req, res) {
    console.log('Host: ' + req.headers.host);
    var errorHandler = function(err, req, res) {
        if (err) console.log(err);
        res.writeHead(500);
        res.end('Oops, something went very wrong...');
    };
    if (req.headers.host === 'static-files.rasmusth.dk') {
        proxy_static_files.proxyRequest(req, res);
        proxy_static_files.on('error', errorHandler);
    } else if (req.headers.host === 'transmission.rasmusth.dk') {
        proxy_transmission.proxyRequest(req, res);
        proxy_transmission.on('error', errorHandler);
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
