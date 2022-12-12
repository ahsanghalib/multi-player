import Hls from "hls.js";
import { Events } from "../Events";
import { MultiPlayer } from "../MultiPlayer";
import { IPlayer, ISource, MimeTypesEnum } from "../types";
import { _getMimeType } from "../Utils";

export class HlsjsPlayer implements IPlayer {
  private _player: MultiPlayer;
  private _hls: Hls | null;
  private _events: Events;
  private _isHlsStopped: boolean;

  constructor(player: MultiPlayer, events: Events) {
    this._events = events;
    this._isHlsStopped = false;
    this._hls = null;
    this._player = player;
    if (!Hls.isSupported()) {
      console.error("HLS.js is not Supported.");
    }
  }

  urlCheck = (source: ISource) => {
    if (!source.url) return false;
    return _getMimeType(source.url) === MimeTypesEnum.M3U8;
  };

  initPlayer = async () => {
    const mediaElement = this._player.getMediaElement();
    const config = this._player.getCurrentConfig();
    const source = this._player.getSource();

    const check = this.urlCheck(source);
    if (mediaElement && check) {
      this._hls = new Hls({
        ...config,
        debug: config.debug,
        startPosition: config.startTime,
      });

      this._hls.attachMedia(mediaElement);

      this._hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this._hls!.loadSource(source.url || "");
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
    if (this._hls && this._isHlsStopped) {
      this._hls.startLoad(startPosition);
      this._isHlsStopped = false;
    }
  };

  stopLoad = () => {
    if (this._hls) {
      this._hls.stopLoad();
      this._isHlsStopped = true;
    }
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
      this._events.loadingErrorEvents(true, false);
    }

    if (d?.fatal) {
      this._events.fatalErrorRetry(d);
    }
  };
}
