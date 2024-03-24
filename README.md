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

## Features

It play simple video formats & m3u8 streams & mpd streams, both DRM & NON-DRM.
Display Close Captions.
Customize close captions.
Casting support
Airplay support.
