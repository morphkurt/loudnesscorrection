/*
MIT License

Copyright (c) [2019] [Damitha Gunawardena]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.setHeader('Cache-Control', 'max-age=3600');
    res.contentType('audio/x-aac');
    var pathToAudio = 'http://example.com'+req.path;
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
	.outputOptions(['-muxdelay 0','-write_id3v2 1','-map_metadata:s:a 0:s:a'])
        .pipe(res, {end: true})
});

app.get("/*.m3u8", function(req, res){ 
  apiProxy.web(req, res, { target: 'http://example.com' });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
