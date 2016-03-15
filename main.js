var http = require('http');
var httpProxy = require('http-proxy');

var proxy_static_files = new httpProxy.createProxyServer({
    target: {
        host: 'localhost',
        port: 20900
    }
});

http.createServer(function(req, res) {
    console.log('Host: ' + req.headers.host);
    if (req.headers.host === 'http://static-files.rasmusth.dk') {
        proxy_static_files.proxyRequest(req, res);
        proxy_static_files.on('error', function(err, req, res) {
            if (err) console.log(err);
            res.writeHead(500);
            res.end('Oops, something went very wrong on static-files...');
        });
    }
}).listen(80);
