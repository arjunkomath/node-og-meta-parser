var express = require('express');
var bodyParser = require('body-parser');
var jsdom = require("jsdom");
var Promise = require('promise');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', function (req, res) {
    res.send('pong!');
});

app.post('/', function (req, res) {
    var url = req.body.url;
    var data = {};
    var promise = new Promise(function (resolve, reject) {
        jsdom.env(
            url,
            ["http://code.jquery.com/jquery.js"],
            function (err, window) {
                window.$('meta[property^=og]').each(function(i, tem) {
                    data[tem.getAttribute('property')] = tem.getAttribute('content');
                });
                resolve(data);
            }
        );
    });
    promise.then (function (data) {
        if(Object.keys(data).length)
            res.json(data);
        else {
            var promise1 = new Promise(function (resolve1, reject1) {
                jsdom.env(
                    url,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {
                        window.$('meta').each(function(i, tem) {
                            if(tem.getAttribute('name')) {
                                data[tem.getAttribute('name')] = tem.getAttribute('content');
                            }
                        });
                        var images = [];
                        window.$('img').each(function(i, tem) {
                            if(tem.getAttribute('alt')) {
                                var img = {};
                                img[tem.getAttribute('alt')] = tem.getAttribute('src');
                                images.push(img);
                            }
                        });
                        data["images"] = images;
                        resolve1(data);
                    }
                );
            });
            promise1.then (function (data) {
                res.json(data);
            });
        }
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server listening at http://%s:%s', host, port);
});
