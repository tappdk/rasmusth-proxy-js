var http = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');
var crypto = require('crypto')

var privateKey = fs.readFileSync('/Users/rasmusth/Documents/Certificates/*.rasmusth.dk_key.pem', 'utf8');
var certificate = fs.readFileSync('/Users/rasmusth/Documents/Certificates/*.rasmusth.dk_cert.pem', 'utf8');

var proxy_static_files = new httpProxy.createProxyServer({
    ssl: {
        key: privateKey,
        cert: certificate
    },
    target: {
        host: 'localhost',
        port: 20900
    },
    secure: true
});

var handler = function (req, res) {
    console.log('Host: ' + req.headers.host);
    if (req.headers.host === 'static-files.rasmusth.dk') {
        proxy_static_files.proxyRequest(req, res);
        proxy_static_files.on('error', function(err, req, res) {
            if (err) console.log(err);
            res.writeHead(500);
            res.end('Oops, something went very wrong on static-files...');
        });
    }
};

var serverOptions = {
    key: privateKey,
    cert: certificate
};
var server = http.createServer(serverOptions);
server.addListener("request", handler);
server.listen(443);
