var http = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');

var proxy_static_files = new httpProxy.createProxyServer({
    ssl: {
        key: fs.readFileSync('/Users/rasmusth/Documents/Certificates/*.rasmusth.dk_key.pem', 'utf8'),
        cert: fs.readFileSync('/Users/rasmusth/Documents/Certificates/*.rasmusth.dk_cert.pem', 'utf8')
    },
    target: {
        host: 'localhost',
        port: 20900
    },
    secure: true
});

https.createServer(function(req, res) {
    console.log('Host: ' + req.headers.host);
    if (req.headers.host === 'static-files.rasmusth.dk') {
        proxy_static_files.proxyRequest(req, res);
        proxy_static_files.on('error', function(err, req, res) {
            if (err) console.log(err);
            res.writeHead(500);
            res.end('Oops, something went very wrong on static-files...');
        });
    }
}).listen(443);
