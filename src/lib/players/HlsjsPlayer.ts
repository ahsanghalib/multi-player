import Hls from "hls.js";
import { Events } from "../Events";
import { IConfig, IPlayer, ISource, MimeTypesEnum } from "../types";
import { getMimeType } from "../Utils";

export class HlsjsPlayer implements IPlayer {
  private _hls: Hls | null;
  private _events: Events;

  constructor(events: Events) {
    this._events = events;
    this._hls = null;
    if (!Hls.isSupported()) {
      throw new Error("HLS.js is not Supported.");
    }
  }

  urlCheck = (source: ISource) => {
    if (!source.url) return false;
    return getMimeType(source.url) === MimeTypesEnum.M3U8;
  };

  initPlayer = async (
    mediaElement: HTMLMediaElement,
    source: ISource,
    config: IConfig
  ) => {
    const check = this.urlCheck(source);
    if (mediaElement && check) {
      this._hls = new Hls({
        ...config,
        debug: config.debug,
        startPosition: config.startTime,
      });

      this._hls.attachMedia(mediaElement);

      this._hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this._hls?.loadSource(source.url || "");
      });

      this.addEvents();

      return Promise.resolve();
    }

    return Promise.reject();
  };

  destroy = async () => {
    if (this._hls) {
      this._hls.destroy();
      this._hls = null;
    }
    return Promise.resolve();
  };

  startLoad = (startPosition?: number) => {
    if (this._hls) this._hls.startLoad(startPosition);
  };

  stopLoad = () => {
    if (this._hls) this._hls.stopLoad();
  };

  addEvents = () => {
    if (this._hls) {
      this._hls.on(Hls.Events.ERROR, this._hlsErrorEvent);
    }
  };

  removeEvents = () => {
    if (this._hls) {
      this._hls.removeAllListeners();
    }
  };

  _hlsErrorEvent = (e: any, d: any) => {
    console.log("hls-error", e, d);
    if (d?.details === "bufferStalledError") {
      this._events.loadingErrorEvents(true, false, "hlsjs - error");
    }

    if (d?.fatal) {
      this._events.fatalErrorRetry(d);
    }
  };
}
