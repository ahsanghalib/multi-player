import Dashjs from "dashjs";
import { Events } from "../Events";
import { DRMEnums, IConfig, IPlayer, ISource, MimeTypesEnum } from "../types";
import { getMimeType } from "../Utils";

export class DashjsPlayer implements IPlayer {
  private _dashjs: Dashjs.MediaPlayerClass;
  private _events: Events;

  constructor(events: Events) {
    this._dashjs = Dashjs.MediaPlayer().create();
    this._dashjs.initialize();
    this._events = events;
  }

  urlCheck = (source: ISource) => {
    if (!source.url) return false;
    const url = getMimeType(source.url) === MimeTypesEnum.MPD;
    const isDrm = source.drm?.drmType === DRMEnums.WIDEVINE;
    return isDrm ? url && !!source.drm?.licenseUrl : url;
  };

  initPlayer = async (
    mediaElement: HTMLMediaElement,
    source: ISource,
    config: IConfig
  ) => {
    const check = this.urlCheck(source);
    if (mediaElement && check) {
      this._dashjs.attachView(mediaElement);
      this._dashjs.setAutoPlay(true);
      this._dashjs.attachSource(source.url || "", config.startTime);
      if (source.drm?.drmType === DRMEnums.WIDEVINE) {
        this._dashjs.setProtectionData({
          "com.widevine.alpha": {
            serverURL: source.drm?.licenseUrl,
            priority: 0,
          },
        });
      }
      this._dashjs
        .getProtectionController()

        .setRobustnessLevel("SW_SECURE_CRYPTO");

      this._dashjs.updateSettings({
        debug: {
          logLevel: config.debug
            ? (Dashjs as any).Debug.LOG_LEVEL_DEBUG
            : (Dashjs as any).Debug.LOG_LEVEL_NONE,
        },
        streaming: {
          scheduling: {
            scheduleWhilePaused: false,
          },
          buffer: {
            fastSwitchEnabled: true,
          },
        },
      });

      this.addEvents();

      await Promise.resolve();
    }

    await Promise.reject();
  };

  destroy = async () => {
    this._dashjs.reset();
    await Promise.resolve();
  };

  addEvents = () => {
    this.removeEvents();
    this._dashjs.on(Dashjs.MediaPlayer.events.ERROR, this._dashjsErrorEvent);
    this._dashjs.on(
      Dashjs.MediaPlayer.events.BUFFER_EMPTY,
      this._dashjsBufferEmptyEvent
    );
    this._dashjs.on(
      Dashjs.MediaPlayer.events.BUFFER_LOADED,
      this._dashjsBufferLoadedEvent
    );
  };

  removeEvents = () => {
    this._dashjs.off(Dashjs.MediaPlayer.events.ERROR, this._dashjsErrorEvent);
    this._dashjs.off(
      Dashjs.MediaPlayer.events.BUFFER_EMPTY,
      this._dashjsBufferEmptyEvent
    );
    this._dashjs.off(
      Dashjs.MediaPlayer.events.BUFFER_LOADED,
      this._dashjsBufferLoadedEvent
    );
  };

  // events
  _dashjsErrorEvent = (d: any) => {
    console.log("dashjs - error", d);
    this._events.loadingErrorEvents(false, true, d);
    // const dashjsErrors = {
    //   23: "CAPABILITY_MEDIASOURCE_ERROR_CODE",
    //   25: "DOWNLOAD_ERROR_ID_MANIFEST_CODE",
    //   27: "DOWNLOAD_ERROR_ID_CONTENT_CODE",
    //   28: "DOWNLOAD_ERROR_ID_INITIALIZATION_CODE",
    //   31: "MANIFEST_ERROR_ID_PARSE_CODE",
    //   32: "MANIFEST_ERROR_ID_NOSTREAMS_CODE",
    //   34: "MANIFEST_ERROR_ID_MULTIPLEXED_CODE",
    //   35: "MEDIASOURCE_TYPE_UNSUPPORTED_CODE",
    //   110: "DRM: KeyStatusChange error! -- License has expired",
    // };

    // const { error } = d;
    // const errorCode = error?.code?.toString();
    // if (errorCode in dashjsErrors) {

    // } else {
    //   this._events.fatalErrorRetry(d);
    // }
  };

  _dashjsBufferLoadedEvent = () => {
    this._events.loadingErrorEvents(false, false);
  };

  _dashjsBufferEmptyEvent = () => {
    this._events.loadingErrorEvents(true, false);
  };
}
