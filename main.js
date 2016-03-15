var http = require('http');
var httpProxy = require('http-proxy');

var proxy_web = new httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 8080
    }
});

var proxy_api = new httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 8081
    }
});

http.createServer(function(req, res) {
    if (req.headers.host === 'http://macminijs.rasmusth.dk') {
        proxy_web.proxyRequest(req, res);
        proxy_web.on('error', function(err, req, res) {
            if (err) console.log(err);
            res.writeHead(500);
            res.end('Oops, something went very wrong on macminijs...');
        });
    } else if (req.headers.host === 'http://test.domain.com') {
        proxy_api.proxyRequest(req, res);
        proxy_api.on('error', function(err, req, res) {
            if (err) console.log(err);
            res.writeHead(500);
            res.end('Oops, something went very wrong on test...');
        });
    }
}).listen(8989);
