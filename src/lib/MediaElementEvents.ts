import type { Events } from "./Events";
import type { MultiPlayer } from "./MultiPlayer";
import type { DashjsPlayer, HlsjsPlayer } from "./players";
import { EventsEnum, IConfig } from "./types";

export class MediaElementEvents {
  private _mediaElement: HTMLMediaElement | null;
  private _player: MultiPlayer;
  private _config?: IConfig;
  private _events: Events;
  private _hls: HlsjsPlayer;
  private _dashjs: DashjsPlayer;
  private _timeUpdated: boolean;
  private _progressCounter: number;

  constructor(
    player: MultiPlayer,
    events: Events,
    hls: HlsjsPlayer,
    dashjs: DashjsPlayer
  ) {
    this._mediaElement = null;
    this._player = player;
    this._events = events;
    this._hls = hls;
    this._dashjs = dashjs;
    this._config = undefined;
    this._timeUpdated = false;
    this._progressCounter = 0;
  }

  _init() {
    this._mediaElement = this._player.getMediaElement();
    this._config = this._player.getCurrentConfig();
    this._addMediaElementEvents();
  }

  _abortEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onAbort");
    this._timeUpdated = false;
  };

  _canPlayEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onCanPlay");
  };

  _canPlayThroughEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onCanPlayThrough");
  };

  _durationChangeEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onDurationChange");
  };

  _emptiedEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onEmptied");
    if (!this._player.getPlayerState().error)
      this._events.loadingErrorEvents(true, false);
  };

  _endedEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onEnded");
    this._events.loadingErrorEvents(false, false);
    this._events.emit(EventsEnum.ENDED, { value: true });
    this._player.setPlayerState({ ended: true });
  };

  _errorEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onError");
    this._events.loadingErrorEvents(false, true);
  };

  _loadedDataEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onLoadedData");
    if (!!this._mediaElement?.buffered?.length) this._player.resetRetryCount();
    this._events.loadingErrorEvents(true, false);
    this._player.setPlayerState({ loaded: true });
    this._player.checkTextTracks();
  };

  _loadedMetaDataEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onLoadedMetaData");
  };

  _loadStartEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onLoadStart");
    this._events.loadingErrorEvents(false, false);
  };

  _pauseEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onPause");
    this._player.setPlayerState({ isPlaying: false });
    this._hls.stopLoad();
    this._dashjs.stopLoad();
  };

  _playEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onPlay");
    this._events.loadingErrorEvents(false, false);
  };

  _playingEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onPlaying");
    this._player.setPlayerState({ isPlaying: true });
    this._events.loadingErrorEvents(false, false);
    this._hls.startLoad();
    this._dashjs.startLoad();
  };

  _progressEvent = () => {
    if (this._config?.debug)
      console.log(
        "VIDEO - onProgress",
        "_progressCounter",
        this._progressCounter,
        "_timeUpdated",
        this._timeUpdated
      );

    if (this._timeUpdated) {
      this._progressCounter = 0;
      this._timeUpdated = false;
      return;
    }

    if (this._progressCounter > 15) {
      this._progressCounter = 0;
      this._player.reloadPlayer().catch((e) => console.log());
    }

    this._progressCounter += 1;
  };

  _rateChangeEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onRateChange");
  };

  _seekedEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onSeeked");
    this._events.loadingErrorEvents(false, false);
    if (!this._player.getPlayerState().isPlaying) {
      this._hls.stopLoad();
      this._dashjs.stopLoad();
    }
  };

  _seekingEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onSeeking");
    if (!this._player.getPlayerState().isPlaying) {
      this._events.loadingErrorEvents(true, false);
      this._hls.startLoad();
      this._dashjs.startLoad();
    }
  };

  _stalledEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onStalled");
    if (this._player.getPlayerState().isPlaying) {
      this._events.loadingErrorEvents(true, false);
    }
  };

  _suspendEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onSuspended");
  };

  _timeUpdateEvent = () => {
    if (this._config?.debug)
      console.log("VIDEO - onTimeUpdate", "_timeUpdated", this._timeUpdated);
    this._timeUpdated = true;
    if (!!this._player.getPlayerState().isPlaying) {
      this._events.loadingErrorEvents(false, false);
    }
  };

  _volumeChagneEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onVolumeChange");
  };

  _waitingEvent = () => {
    if (this._config?.debug) console.log("VIDEO - onWating");
    this._events.loadingErrorEvents(true, false);
  };

  _addMediaElementEvents = () => {
    this._removeMediaElementEvents();
    if (this._mediaElement) {
      this._mediaElement.addEventListener(EventsEnum.ABORT, this._abortEvent);
      this._mediaElement.addEventListener(
        EventsEnum.CANPLAY,
        this._canPlayEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.CANPLAYTHROUGH,
        this._canPlayThroughEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.DURATIONCHANGE,
        this._durationChangeEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.EMPTIED,
        this._emptiedEvent
      );
      this._mediaElement.addEventListener(EventsEnum.ENDED, this._endedEvent);
      this._mediaElement.addEventListener(EventsEnum.ERROR, this._errorEvent);
      this._mediaElement.addEventListener(
        EventsEnum.LOADEDDATA,
        this._loadedDataEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.LOADEDMETADATA,
        this._loadedMetaDataEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.LOADSTART,
        this._loadStartEvent
      );
      this._mediaElement.addEventListener(EventsEnum.PAUSE, this._pauseEvent);
      this._mediaElement.addEventListener(EventsEnum.PLAY, this._playEvent);
      this._mediaElement.addEventListener(
        EventsEnum.PLAYING,
        this._playingEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.PROGRESS,
        this._progressEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.RATECHANGE,
        this._rateChangeEvent
      );
      this._mediaElement.addEventListener(EventsEnum.SEEKED, this._seekedEvent);
      this._mediaElement.addEventListener(
        EventsEnum.SEEKING,
        this._seekingEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.STALLED,
        this._stalledEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.SUSPEND,
        this._suspendEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.TIMEUPDATE,
        this._timeUpdateEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.VOLUMECHANGE,
        this._volumeChagneEvent
      );
      this._mediaElement.addEventListener(
        EventsEnum.WAITING,
        this._waitingEvent
      );
    }
  };

  _removeMediaElementEvents = () => {
    if (this._mediaElement) {
      this._mediaElement.removeEventListener(
        EventsEnum.ABORT,
        this._abortEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.CANPLAY,
        this._canPlayEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.CANPLAYTHROUGH,
        this._canPlayThroughEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.DURATIONCHANGE,
        this._durationChangeEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.EMPTIED,
        this._emptiedEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.ENDED,
        this._endedEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.ERROR,
        this._errorEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.LOADEDDATA,
        this._loadedDataEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.LOADEDMETADATA,
        this._loadedMetaDataEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.LOADSTART,
        this._loadStartEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.PAUSE,
        this._pauseEvent
      );
      this._mediaElement.removeEventListener(EventsEnum.PLAY, this._playEvent);
      this._mediaElement.removeEventListener(
        EventsEnum.PLAYING,
        this._playingEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.PROGRESS,
        this._progressEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.RATECHANGE,
        this._rateChangeEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.SEEKED,
        this._seekedEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.SEEKING,
        this._seekingEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.STALLED,
        this._stalledEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.SUSPEND,
        this._suspendEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.TIMEUPDATE,
        this._timeUpdateEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.VOLUMECHANGE,
        this._volumeChagneEvent
      );
      this._mediaElement.removeEventListener(
        EventsEnum.WAITING,
        this._waitingEvent
      );
    }
  };
}
