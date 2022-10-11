/* eslint-disable @typescript-eslint/no-explicit-any */
import muxjs from "mux.js";
import { Events } from "./Events";
import { DashjsPlayer, ShakaPlayer, HlsjsPlayer } from "./players";
import {
  DRMEnums,
  EventsEnum,
  EventsEnumType,
  IConfig,
  ISource,
  Listener,
} from "./types";

class MultiPlayer {
  static _instance: MultiPlayer;
  mediaElement: HTMLMediaElement | null;
  private hls: HlsjsPlayer;
  private shaka!: ShakaPlayer;
  private dashjs: DashjsPlayer;
  private readonly _events: Events;

  private constructor() {
    (window as any).muxjs = muxjs;
    this._events = new Events();
    this.mediaElement = null;
    this.hls = new HlsjsPlayer(this._events);
    this.shaka = new ShakaPlayer(this._events);
    this.dashjs = new DashjsPlayer(this._events);
  }

  static _isBrowser = (): boolean => {
    return typeof window === "object";
  };

  public static getInstance = (): MultiPlayer => {
    if (this._isBrowser()) {
      if (!MultiPlayer._instance) {
        MultiPlayer._instance = new MultiPlayer();
      }
      return MultiPlayer._instance;
    } else {
      throw new Error("Library only supported in browsers!");
    }
  };

  getDefaultConfig = (): IConfig => {
    return {
      debug: false,
      useShakaForDashStreams: false,
      isVidgo: false,
      startTime: undefined,
    };
  };

  detachMediaElement = async () => {
    try {
      await this.hls.destroy();
      await this.dashjs.destroy();
      await this.shaka.destroy();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject();
    }
  };

  setSource = (source: ISource, config: IConfig) => {
    this.mediaElement = document.querySelector("video[data-multi-player]");
    if (!this.mediaElement) {
      console.error(
        "Please create video element with data-multi-player attribute function."
      );
      return;
    }
    const newConfig = { ...this.getDefaultConfig(), ...config };

    this.detachMediaElement()
      .then(async () => {
        try {
          if (source.drm?.drmType === DRMEnums.FAIRPLAY) {
            await this.shaka.initPlayer(
              this.mediaElement!,
              source,
              newConfig,
              config.isVidgo
            );
            return;
          }

          if (source.drm?.drmType === DRMEnums.WIDEVINE) {
            if (newConfig.useShakaForDashStreams) {
              await this.shaka.initPlayer(
                this.mediaElement!,
                source,
                newConfig,
                config.isVidgo
              );
              return;
            }

            await this.dashjs.initPlayer(this.mediaElement!, source, newConfig);
            return;
          }

          if (source.url) {
            this.hls.initPlayer(this.mediaElement!, source, newConfig);
            return;
          }

          this._events.loadingErrorEvents(
            false,
            false,
            `Provided sourcee is not correct please check, src: ${JSON.stringify(
              source
            )}`
          );
        } catch (e) {
          this._events.emit(EventsEnum.ERROR, {
            event: EventsEnum.ERROR,
            value: true,
            detail: null,
          });
        }
      })
      .catch(() => {
        this._events.emit(EventsEnum.ERROR, {
          event: EventsEnum.ERROR,
          value: true,
          detail: null,
        });
      });
  };

  /**
   * event methods.
   */
  on = (event: EventsEnumType, fn: Listener) => {
    this._events.on(event, fn);
  };

  removeAllListeners = () => {
    this._events.removeAllListeners();
  };

  // /**
  //  * media element events.
  //  * */
  // _waitingEvent = () => {
  //   this._loadingErrorEvents(true, false, "video - wating event");
  // };

  // _playingEvent = () => {
  //   this.isPlaying = true;
  //   this._loadingErrorEvents(false, false, "video - playing event");
  //   if (this.hls) this.hls.startLoad();
  // };

  // _pauseEvent = () => {
  //   this.isPlaying = false;
  //   this._loadingErrorEvents(false, false, "video - pause event");
  //   if (this.hls) this.hls.stopLoad();
  // };

  // _addMediaElementEvents = () => {
  //   this._removeMediaElementEvents();
  //   if (this.mediaElement) {
  //     this.mediaElement.addEventListener(
  //       VideoEventsEnum.WAITING,
  //       this._waitingEvent
  //     );
  //     this.mediaElement.addEventListener(
  //       VideoEventsEnum.PLAYING,
  //       this._playingEvent
  //     );
  //     this.mediaElement.addEventListener(
  //       VideoEventsEnum.PAUSE,
  //       this._pauseEvent
  //     );
  //   }
  // };

  // _removeMediaElementEvents = () => {
  //   if (this.mediaElement) {
  //     this.mediaElement.removeEventListener(
  //       VideoEventsEnum.WAITING,
  //       this._waitingEvent
  //     );
  //     this.mediaElement.removeEventListener(
  //       VideoEventsEnum.PLAYING,
  //       this._playingEvent
  //     );
  //     this.mediaElement.removeEventListener(
  //       VideoEventsEnum.PAUSE,
  //       this._pauseEvent
  //     );
  //   }
  // };
}

export const multiPlayer = MultiPlayer.getInstance();

/**
The only cross-browser solution I have found to date is: Hide the video’s text tracks and use your own.
This will allow you to create your own text nodes, with classes, id’s etc. which can then be styled simply via css.
In order to do so, you would utilize the onenter and onexit methods of the text cues in order to implement your own text nodes.

let video   = document.querySelector(‘YOUR_VIDEO_SELECTOR’)
    tracks  = video.textTracks[0],
    tracks.mode = 'hidden', // must occur before cues is retrieved
    cues    = tracks.cues;

  let replaceText = function(text) {
        $('WHERE_TEXT_GETS_INSERTED').html(text);
      },

      showText = function() {
        $('WHERE_TEXT_GETS_INSERTED').show();
      },

      hideText = function() {
        $('WHERE_TEXT_GETS_INSERTED').hide();
      },

      cueEnter = function() {
        replaceText(this.text);
        showText();
      },

      cueExit = function() {
        hideText();
      },

      videoLoaded = function(e) {
        for (var i in cues) {
          var cue = cues[i];
          cue.onenter = cueEnter;
          cue.onexit = cueExit;
        }
      },

      playVideo = function(e) {
        video.play();
      };

  video.addEventListener('loadedmetadata', videoLoaded);
  video.addEventLister('load', playVideo);
  video.load();

  */
