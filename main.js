var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

var httpPort = argv['p'];
if (!valueIsValidPort(httpPort)) {
    httpPort = 80;
}

var httpsPort = argv['s'];
if (!valueIsValidPort(httpsPort)) {
    httpsPort = 443;
}

var privateKey = fs.readFileSync('/etc/letsencrypt/live/rhummelmose.dk/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/rhummelmose.dk/fullchain.pem', 'utf8');
var ssl = {
    key: privateKey,
    cert: certificate
};

var proxyStaticFiles = new httpProxy.createProxyServer({
    ssl: ssl,
    secure: true,
    target: 'https://local.rhummelmose.dk:20900'
});

var proxyTransmission = new httpProxy.createProxyServer({
    target: 'http://192.168.1.123:9091'
});

var proxyPlexPy = new httpProxy.createProxyServer({
    target: 'http://localhost:8181'
});

var proxyWWW = new httpProxy.createProxyServer({
    target: 'http://localhost:20901'
});

var handler = function(req, res) {
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
    } else if (req.headers.host === 'plexpy.rasmusth.dk') {
        proxyPlexPy.proxyRequest(req, res);
        proxyPlexPy.on('error', errorHandler);
    } else if (req.headers.host === 'www.rasmusth.dk') {
        proxyWWW.proxyRequest(req, res);
        proxyWWW.on('error', errorHandler);
    } else {
        var location = 'https://www.rhummelmose.dk';
        if (httpsPort !== 443) {
            location += ':' + httpsPort;
        }
        res.writeHead(302, {
            'Location': location
        });
        res.end();
    }
};

var server = https.createServer(ssl);
server.addListener('request', handler);
server.listen(httpsPort);

var redirectionHandler = function(req, res) {
    host = domainByRemovingPortFromHost(req.headers.host);
    if (httpsPort !== 443) {
        host += ":" + httpsPort;
    }
    res.writeHead(302, {
        'Location': 'https://' + host + req.url
    });
    res.end();
};

var redirectionServer = http.createServer();
redirectionServer.addListener('request', redirectionHandler);
redirectionServer.listen(httpPort);

function domainByRemovingPortFromHost(host) {
    var indexOfPortColon = host.lastIndexOf(':');
    if (indexOfPortColon === -1) {
        return host;
    }
    return host.substring(0, indexOfPortColon);
}

function portByRemovingDomainFromHost(host) {
    var indexOfPortColon = host.lastIndexOf(':');
    if (indexOfPortColon === -1) {
        return null;
    }
    return host.substring(indexOfPortColon + 1);
}

function valueIsValidPort(value) {
    var isNumber = typeof value === 'number';
    var isInteger = value % 1 === 0;
    var isUnsigned = value > 1;
    return isNumber && isInteger && isUnsigned;
}
