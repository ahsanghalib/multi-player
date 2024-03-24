# Video Player Library

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/ahsanghalib/multi-player)

This repo using HLS.js & Shaka Player also have Navtive Player support with a simple minimal UI. To
play all types of streams with minimal configs.

## Purpose

Purpose of this repo is to help using mulitple media libaries to play different types of video
streams.

## Demo

Check demo folder. Open in StackBlitz.

```
player.init({
    elem: containerRef.current,
    source: { ...source, startTime: startPosition },
    contextLogoUrl: '/logo.png',
    config: { debug: false, castReceiverId: '1110A70D' },
    onPlayCallback: onVideoResumed,
    onPauseCallback: onVideoPaused,
    onPlayerStateChange: setPlayerState,
    onLeavePIPCallback,
    onEnterPIPCallback,
    // callbacks for player events to intercept.
    eventCallbacks: [
      {
        event: 'LOADEDMETADATA',
        callback: updatePlayTimer
      },
      {
        event: 'TIMEUPDATE',
        callback: updatePlayTimer
      }
    ]
  }).catch(() => {});
```

## Install

This repo is available via jsDeliver. If using React or any other library you can add following
lines in index.html file

```
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/ahsanghalib/multi-player@0.1.0/dist/index.css"
  />
  <script
    src="https://cdn.jsdelivr.net/gh/ahsanghalib/multi-player@0.1.0/dist/index.js"
    type="module"
  ></script>

```

this will expose `mplayer` object to via windows

```
window.mplayer.init({...})
```

or to use directly in html file.

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/ahsanghalib/multi-player@0.1.0/dist/index.css"
    />
    <title>Multi Player Test</title>
  </head>
  <body>
    <div id="container"></div>
    <script type="module">
      import mplayer from 'https://cdn.jsdelivr.net/gh/ahsanghalib/multi-player@0.1.0/dist/index.js';
      mplayer.init({
        elem: document.getElementById('container'),
        source: {
          url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
        },
        config: {
          debug: true,
        },
      });
    </script>
  </body>
</html>
```

## Features

It play simple video formats & m3u8 streams & mpd streams, both DRM & NON-DRM.
Display Close Captions.
Customize close captions.
Casting support
Airplay support.
