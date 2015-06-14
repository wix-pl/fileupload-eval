var wixconnect = require('./wixconnect.js');
var https = require('https');
var dotenv = require('dotenv').load();

var SECRET_KEY = process.env.WIX_SECRET || 'YOUR SECRET KEY';
var APP_ID = process.env.WIX_APP_ID || 'YOUR APPLICATION ID';
var INSTANCE_ID = process.env.WIX_INSTANCE_ID || 'YOUR INSTANCE ID';

var wr = wixconnect.createRequest('GET', '/v1/activities/types', SECRET_KEY, APP_ID, INSTANCE_ID);
wr.asWixQueryParams();

var req = https.request(wr.toHttpsOptions(), function(res) {
    if(res.statusCode !== 200) {
        console.log('Could not get types')
    }
    res.on('data', function(d) {
        var response = JSON.parse(d.toString('utf8'));
        console.log(response);
    });
});
req.on('error', function(e) {
    if (e) {
        throw e;
    }
});
req.end();
