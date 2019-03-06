# Normalizing the Loudness of Audio Content via HLS proxy server

~~~~
+---------+      +----------+     +------+       +------+
| Audio   |      | HLS      |     | CDN  |       | User |
| Encoder +----->+ Packager +---->+      +------>+      |
+---------+      +----------+     +---+--+       +------+
                                      | Intercepts *aac
                                      | Bypass *.m3u8
                                      v
                                +-----+----+    +------+       +------+
                                | Loudness |    | CDN  |       | User |
                                | Proxy    +--->+      +------>+      |
                                +----------+    +------+       +------+
~~~~

When creating Alexa apps you are required to set audio loudness levels to satisfy following requirments.

* Program loudness for Alexa should average -14 dB LUFS/LKFS.
* The true-peak value should not exceed -2 dBFS

Your skill may be rejected if program loudness:

* Is lower than -19 dB LUFS
* Is higher than -9dB LUFS
* Exceeds true-peak guidelines

The Alexa [Documentation](https://developer.amazon.com/docs/flashbriefing/normalizing-the-loudness-of-audio-content.html)

This is an express / fluent-ffmpeg and http-proxy node script to intecept audio (can be extended to video) and increases the audio levels to Alexa recommended levels.

# Learnings

* The libfdk_aac audio encoder introduced some gaps in the audio playback, FFmpeg default aac encoder seems to handle gaps better.
* HLS audio segments must signal the timestap of its first sample with ID3 private [frame](https://tools.ietf.org/html/rfc8216), this required ID3 version enabled on the ADTS muxer`
'-write_id3v2 1','-map_metadata:s:a 0:s:a`
* Stream were tested on iOS devices and Video.JS html5 players.

# Caution
This solution was not used in production as we found a way to satisfy the loudness levels from the source.
