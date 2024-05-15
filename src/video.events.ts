import { EventsEnum, PlayersEnum, STORAGE_KEYS } from './types';
import { UI } from './ui';
import { Utils } from './utils';

export class VideoEvents {
  private ui: UI;
  timeUpdated = false;
  progressCounter = 0;
  events: Array<{ event: EventsEnum; callback: (e: any) => void }> = [];

  constructor(ui: UI) {
    this.ui = ui;
    this.events = [
      { event: EventsEnum.ABORT, callback: this.abortEvent.bind(this) },
      { event: EventsEnum.CANPLAY, callback: this.canPlayEvent.bind(this) },
      {
        event: EventsEnum.CANPLAYTHROUGH,
        callback: this.canPlayThroughEvent.bind(this),
      },
      {
        event: EventsEnum.DURATIONCHANGE,
        callback: this.durationChangeEvent.bind(this),
      },
      { event: EventsEnum.EMPTIED, callback: this.emptiedEvent.bind(this) },
      { event: EventsEnum.ENDED, callback: this.endedEvent.bind(this) },
      { event: EventsEnum.ERROR, callback: this.errorEvent.bind(this) },
      {
        event: EventsEnum.LOADEDDATA,
        callback: this.loadedDataEvent.bind(this),
      },
      {
        event: EventsEnum.LOADEDMETADATA,
        callback: this.loadedMetaDataEvent.bind(this),
      },
      { event: EventsEnum.LOADSTART, callback: this.loadStartEvent.bind(this) },
      { event: EventsEnum.PAUSE, callback: this.pauseEvent.bind(this) },
      { event: EventsEnum.PLAY, callback: this.playEvent.bind(this) },
      { event: EventsEnum.PLAYING, callback: this.playingEvent.bind(this) },
      { event: EventsEnum.PROGRESS, callback: this.progressEvent.bind(this) },
      {
        event: EventsEnum.RATECHANGE,
        callback: this.rateChangeEvent.bind(this),
      },
      { event: EventsEnum.SEEKED, callback: this.seekedEvent.bind(this) },
      { event: EventsEnum.SEEKING, callback: this.seekingEvent.bind(this) },
      { event: EventsEnum.STALLED, callback: this.stalledEvent.bind(this) },
      { event: EventsEnum.SUSPEND, callback: this.suspendEvent.bind(this) },
      {
        event: EventsEnum.TIMEUPDATE,
        callback: this.timeUpdateEvent.bind(this),
      },
      {
        event: EventsEnum.VOLUMECHANGE,
        callback: this.volumeChangeEvent.bind(this),
      },
      { event: EventsEnum.WAITING, callback: this.waitingEvent.bind(this) },
    ];
  }

  addEvents = () => {
    this.removeEvents();
    this.events.forEach((d) => {
      if (this.ui.videoElement) {
        this.ui.videoElement.addEventListener(d.event, d.callback);
      }
    });
  };

  removeEvents = () => {
    this.events.forEach((d) => {
      if (this.ui.videoElement) {
        this.ui.videoElement.removeEventListener(d.event, d.callback);
      }
    });
  };

  getConfig = () => {
    return this.ui.player?.getConfig();
  };

  abortEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onAbort');
    this.timeUpdated = false;
    Utils.addEventCallback(this.ui, EventsEnum.ABORT);
  };

  canPlayEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onCanPlay');
    Utils.addEventCallback(this.ui, EventsEnum.CANPLAY);
  };

  canPlayThroughEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onCanPlayThrough');
    Utils.addEventCallback(this.ui, EventsEnum.CANPLAYTHROUGH);
  };

  durationChangeEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onDurationChange');
    Utils.addEventCallback(this.ui, EventsEnum.DURATIONCHANGE);
  };

  emptiedEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onEmptied');
    this.ui.player?.setPlayerState({ isPlaying: false });
    if (
      (this.ui.player?.playerState.uiState === 'error',
      this.ui.player?.playerState.player !== PlayersEnum.SHAKA)
    ) {
      Utils.toggleWrappers({ ui: this.ui, loading: true });
    }
    Utils.addEventCallback(this.ui, EventsEnum.EMPTIED);
  };

  endedEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onEnded');
    Utils.toggleWrappers({ ui: this.ui, ended: true });
    Utils.addEventCallback(this.ui, EventsEnum.ENDED);
  };

  errorEvent = (e: any) => {
    console.log('error', e);
    if (this.getConfig()?.debug) console.log('VIDEO - onError');
    Utils.fatelErrorRetry(this.ui);
    Utils.addEventCallback(this.ui, EventsEnum.ERROR);
  };

  loadedDataEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onLoadedData');
    if (this.ui.videoElement?.buffered.length) {
      Utils.resetRetryCounter();
    }
    if (!this.getConfig()?.disableControls && this.ui.controlsWrapper) {
      Utils.toggleShowHide(this.ui.controlsWrapper, 'flex');
      Utils.toggleOpacity(this.ui.controlsWrapper, false);
    }
    this.ui.player?.setPlayerState({ loaded: true, isPlaying: false });
    Utils.checkTextTracks(this.ui);
    this.volumeChangeEvent();
    Utils.addEventCallback(this.ui, EventsEnum.LOADEDDATA);
  };

  loadedMetaDataEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onLoadedMetaData');
    const video = this.ui.videoElement;
    if (video) {
      if (this.getConfig()?.startMuted) video.muted = true;
      video
        .play()
        .then(() => {})
        .catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
    }
    Utils.addEventCallback(this.ui, EventsEnum.LOADEDMETADATA);
  };

  loadStartEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onLoadStart');
    Utils.toggleWrappers({ ui: this.ui, loading: true });
    this.ui.player?.setPlayerState({ isPlaying: false });
    Utils.addEventCallback(this.ui, EventsEnum.LOADSTART);
  };

  pauseEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onPause');
    if (this.ui.controlsPlayPauseButton) {
      this.ui.controlsPlayPauseButton.innerHTML = Utils.Icons({ type: 'play' });
    }
    this.ui.player?.setPlayerState({ isPlaying: false });
    if (this.ui.player?.playerState.isPIP) this.ui.player?.onPauseCallback?.();
    Utils.addEventCallback(this.ui, EventsEnum.PAUSE);
  };

  playEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onPlay');
    Utils.toggleWrappers({ ui: this.ui, none: true });
    if (this.ui.player?.playerState.isPIP) this.ui.player?.onPlayCallback?.();
    Utils.addEventCallback(this.ui, EventsEnum.PLAY);
  };

  playingEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onPlaying');
    if (this.ui.controlsPlayPauseButton) {
      this.ui.controlsPlayPauseButton.innerHTML = Utils.Icons({
        type: 'pause',
      });
    }
    Utils.toggleWrappers({ ui: this.ui, none: true });
    this.ui.player?.setPlayerState({ isPlaying: true });
    Utils.resetRetryCounter();
    Utils.addEventCallback(this.ui, EventsEnum.PLAYING);
  };

  progressEvent = () => {
    if (this.getConfig()?.debug) {
      console.log(
        'VIDEO - onProgress',
        'progressCounter',
        this.progressCounter,
        'timeUpdated',
        this.timeUpdated,
      );
    }

    Utils.addEventCallback(this.ui, EventsEnum.PROGRESS);

    if (!this.ui.player?.playerState.hasUserPaused) {
      if (this.timeUpdated) {
        this.progressCounter = 0;
        this.timeUpdated = false;
        return;
      }

      if (this.progressCounter > 5 && this.progressCounter <= 10) {
        if (this.ui.videoElement?.buffered?.length) {
          this.ui.videoElement.currentTime = this.ui.videoElement.buffered.end(0);
        }
      }

      if (this.progressCounter > 10) {
        this.progressCounter = 0;
        this.ui.player?.reloadPlayer().catch(() => console.log());
      }
    }

    this.progressCounter += 1;
  };

  rateChangeEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onRateChange');
    Utils.toggleWrappers({ ui: this.ui, loading: true });
    Utils.addEventCallback(this.ui, EventsEnum.RATECHANGE);
  };

  seekedEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onSeeked', this.ui.player?.playerState);
    Utils.toggleWrappers({ ui: this.ui, none: true });
    if (!this.ui.player?.playerState.isPlaying) {
      this.ui.player?.hls.stopLoad();
      if (!this.ui.player?.playerState.hasUserPaused) {
        this.ui.videoElement?.play().catch(() => console.log());
      }
    }
    Utils.addEventCallback(this.ui, EventsEnum.SEEKED);
  };

  seekingEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onSeeking');
    if (!this.ui.player?.playerState.isPlaying) {
      Utils.toggleWrappers({ ui: this.ui, loading: true });
      this.ui.player?.hls.startLoad();
    }
    Utils.addEventCallback(this.ui, EventsEnum.SEEKING);
  };

  stalledEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onStalled');
    if (this.ui.player?.playerState.isPlaying) {
      Utils.toggleWrappers({ ui: this.ui, loading: true });
    }
    if (Utils.isLive(this.ui) && !this.timeUpdated && !this.ui.player?.playerState.hasUserPaused) {
      if (this.ui.videoElement?.buffered.length) {
        this.ui.videoElement.currentTime = this.ui.videoElement.buffered.end(0);
      }
      this.ui.videoElement?.play().catch(() => {});
    }
    Utils.addEventCallback(this.ui, EventsEnum.STALLED);
  };

  suspendEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onSuspend');
    Utils.addEventCallback(this.ui, EventsEnum.SUSPEND);
  };

  timeUpdateEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onTimeUpdate');
    this.timeUpdated = true;
    if (this.ui.player?.playerState.isPlaying) {
      Utils.toggleWrappers({ ui: this.ui, none: true });
    }
    const video = this.ui.videoElement;
    const currentTime = video?.currentTime;
    const duration = video?.duration;
    const isLive = Utils.isLive(this.ui);

    if (this.ui.player?.playerState.loaded) {
      if (isLive) {
        if (this.ui.controlsTimeText) this.ui.controlsTimeText.innerText = 'Live';
        if (this.ui.controlsProgressBar) Utils.toggleShowHide(this.ui.controlsProgressBar, 'none');
      } else if (duration && currentTime) {
        sessionStorage.setItem(STORAGE_KEYS.VIDOE_CURRENT_TIME, String(Math.floor(currentTime)));
        if (this.ui.controlsProgressBar) Utils.toggleShowHide(this.ui.controlsProgressBar, 'flex');
        if (this.ui.controlsProgressRangeInput) {
          Utils.sliderColorValue(this.ui.controlsProgressRangeInput);
          this.ui.controlsProgressRangeInput.value = String(currentTime);
        }
        if (this.ui.controlsTimeText) {
          this.ui.controlsTimeText.innerText = `${Utils.formatTime(
            currentTime,
          )} / ${Utils.formatTime(duration)}`;
        }
        if (this.ui.controlsProgressRangeInput) {
          this.ui.controlsProgressRangeInput.max = String(duration);
        }
      } else {
        if (this.ui.controlsTimeText) this.ui.controlsTimeText.innerText = '';
      }
    }

    Utils.addEventCallback(this.ui, EventsEnum.TIMEUPDATE);
  };

  volumeChangeEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onVolumeChange');
    const video = this.ui.videoElement;
    if (video?.muted) {
      this.ui.volumeSliderValue = '0';
      if (this.ui.controlsVolumeRangeInput) this.ui.controlsVolumeRangeInput.value = '0';
      this.ui.player?.setPlayerState({ isMuted: true });
      if (this.ui.controlsVolumeButton)
        this.ui.controlsVolumeButton.innerHTML = Utils.Icons({
          type: 'volume_off',
        });
    } else {
      this.ui.volumeSliderValue = String(video?.volume);
      if (this.ui.controlsVolumeRangeInput)
        this.ui.controlsVolumeRangeInput.value = String(video?.volume);
      this.ui.player?.setPlayerState({ isMuted: false });
      if (video && video.volume > 0.5) {
        if (this.ui.controlsVolumeButton)
          this.ui.controlsVolumeButton.innerHTML = Utils.Icons({
            type: 'volume_up',
          });
      } else {
        if (this.ui.controlsVolumeButton)
          this.ui.controlsVolumeButton.innerHTML = Utils.Icons({
            type: 'volume_down',
          });
      }
    }
    if (this.ui.controlsVolumeRangeInput) Utils.sliderColorValue(this.ui.controlsVolumeRangeInput);
    Utils.addEventCallback(this.ui, EventsEnum.VOLUMECHANGE);
  };

  waitingEvent = () => {
    if (this.getConfig()?.debug) console.log('VIDEO - onWaiting');
    Utils.toggleWrappers({ ui: this.ui, loading: true });
    if (!this.ui.player?.playerState.hasUserPaused) {
      this.ui.player?.hls.startLoad();
    }
    Utils.addEventCallback(this.ui, EventsEnum.WAITING);
  };
}
