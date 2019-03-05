'use strict';
var express = require('express');
var ffmpeg = require('fluent-ffmpeg');
var PORT = 80;
var HOST = '0.0.0.0';
const app = express();

var httpProxy = require('http-proxy');

var apiProxy = httpProxy.createProxyServer();


app.get('/*.aac', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.setHeader('Cache-Control', 'max-age=3600');
    res.contentType('audio/x-aac');
    var pathToAudio = 'http://aflradio.wow1.vos.bigpond.com'+req.path;
    ffmpeg(pathToAudio)
        .audioFilters('loudnorm=I=-16:TP=-3:LRA=16')
        .audioFilters('asetpts=PTS')
	.audioBitrate('128k')
	.audioFrequency(48000)
	.format('adts')
	.audioCodec('aac')
	.on('start', function(commandLine) {
    		console.log('Spawned Ffmpeg with command: ' + commandLine);
  	})
        .on('error', function(err) {
            console.log('an error happened: ' + err.message);
	    res.end();
        })
	.outputOptions(['-copyts','-muxdelay 0','-write_id3v2 1','-map_metadata:s:a 0:s:a'])
        .pipe(res, {end: true})
});

app.get("/*.m3u8", function(req, res){ 
  apiProxy.web(req, res, { target: 'http://aflradio.wow1.vos.bigpond.com' });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
