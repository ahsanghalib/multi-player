import Shaka from "shaka-player/dist/shaka-player.compiled.debug";
import type { Events } from "../Events";
import type { MultiPlayer } from "../MultiPlayer";
import {
  DRMEnums,
  IPlayer,
  ISource,
  MimeTypesEnum,
  PlayersEnum,
  ShakaEventsEnum,
} from "../types";
import { _getMimeType, _isSafari } from "../Utils";

export class ShakaPlayer implements IPlayer {
  private _shaka: Shaka.Player;
  private _events: Events;
  private _player: MultiPlayer;
  private _url: string | null = null;

  constructor(player: MultiPlayer, events: Events) {
    this._events = events;
    this._player = player;
    this._shaka = new Shaka.Player();
    if (Shaka.Player.isBrowserSupported()) {
      Shaka.polyfill.installAll();
    } else {
      console.error("Shaka Player is not Supported.");
    }
  }

  urlCheck = (source: ISource) => {
    if (!source.url) return false;

    if (
      _getMimeType(source.url) === MimeTypesEnum.M3U8 &&
      source.drm?.drmType === DRMEnums.FAIRPLAY &&
      !!source.drm?.certicateUrl &&
      !!source.drm?.licenseUrl
    ) {
      return true;
    }

    if (
      _getMimeType(source.url) === MimeTypesEnum.MPD &&
      source.drm?.drmType === DRMEnums.WIDEVINE &&
      !!source.drm?.licenseUrl
    ) {
      return true;
    }

    return false;
  };

  initPlayer = async () => {
    const mediaElement = this._player.getMediaElement();
    const config = this._player.getCurrentConfig();
    const source = this._player.getSource();

    const check = this.urlCheck(source);
    if (mediaElement && source) {
      (Shaka as any).log.setLevel(
        config.debug
          ? (Shaka as any).log.Level.DEBUG
          : (Shaka as any).log.Level.NONE
      );

      this._shaka.resetConfiguration();

      await this._shaka.attach(mediaElement);

      let drmConfig = {};

      if (_isSafari() && source.drm?.drmType === DRMEnums.FAIRPLAY) {
        drmConfig = {
          drm: {
            servers: {
              "com.apple.fps.1_0": source.drm?.licenseUrl,
            },
            advanced: {
              "com.apple.fps.1_0": {
                serverCertificateUri: source.drm?.certicateUrl,
              },
            },
          },
        };

        if (config.isVidgo) {
          this.vidgoResponseFilter();
        } else {
          this._shaka.getNetworkingEngine()!.clearAllResponseFilters();
        }
      }

      if (source.drm?.drmType === DRMEnums.WIDEVINE) {
        drmConfig = {
          drm: {
            servers: {
              "com.widevine.alpha": source.drm?.licenseUrl,
            },
            advanced: {
              "com.widevine.alpha": {
                videoRobustness: "SW_SECURE_CRYPTO",
                audioRobustness: "SW_SECURE_CRYPTO",
              },
            },
          },
        };
      }

      this._shaka.configure({
        streaming: {
          alwaysStreamText: true,
          autoLowLatencyMode: true,
          jumpLargeGaps: true,
          lowLatencyMode: false,
          updateIntervalSeconds: 0.5,
        },
        ...drmConfig,
      });

      this.addEvents();

      let mimeType = _getMimeType(source.url || "");

      this._url = source?.url;

      this._shaka
        .load(source.url || "", config.startTime, mimeType)
        .then(async () => {
          try {
            if (mediaElement) await mediaElement.play();
            return Promise.resolve();
          } catch (e) {}
        })
        .catch(() => {
          return Promise.reject();
        });
    }

    return Promise.reject();
  };

  vidgoResponseFilter = () => {
    this._shaka.getNetworkingEngine()!.clearAllResponseFilters();
    this._shaka.getNetworkingEngine()!.registerResponseFilter((type: any, resp: any) => {
      if (type === Shaka.net.NetworkingEngine.RequestType.LICENSE) {
        const jsonResp = JSON.parse(
          String.fromCharCode.apply(
            null,
            new Uint8Array(resp.data as any) as any
          )
        );
        const raw = Buffer.from(jsonResp.ckc, "base64");
        const rawLength = raw.length;
        const data = new Uint8Array(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i += 1) {
          data[i] = raw[i];
        }
        resp.data = data;
      }
    });
  };

  reload = async () => {
    if (this._url) {
      try {
        await this._shaka.load(this._url || "");
        return Promise.resolve();
      } catch (e) {
        return Promise.reject();
      }
    }
    return Promise.reject();
  };

  destroy = async () => {
    await this._shaka.detach();
    this._player.setPlayerState({ player: PlayersEnum.NONE });
    await Promise.resolve();
  };

  addEvents = () => {
    this.removeEvents();
    this._shaka.addEventListener(
      ShakaEventsEnum.BUFFERING,
      this._shakaBufferingEvent
    );
    this._shaka.addEventListener(ShakaEventsEnum.ERROR, this._shakaErrorEvent);
    this._shaka.addEventListener(
      ShakaEventsEnum.STALL_DETECTED,
      this._shakaStallDetectedEvent
    );
  };

  removeEvents = () => {
    this._shaka.removeEventListener(
      ShakaEventsEnum.BUFFERING,
      this._shakaBufferingEvent
    );
    this._shaka.removeEventListener(
      ShakaEventsEnum.ERROR,
      this._shakaErrorEvent
    );
    this._shaka.removeEventListener(
      ShakaEventsEnum.STALL_DETECTED,
      this._shakaStallDetectedEvent
    );
  };

  _shakaBufferingEvent = (d: any) => {
    if (this._player.getPlayerState().loaded) {
      if (d?.buffering) {
        this._events.loadingErrorEvents(true, false);
      } else {
        this._events.loadingErrorEvents(false, false);
      }
    }
  };

  _shakaErrorEvent = (d: any) => {
    console.log("shaka-error-event", d);
    if (d?.severity === Shaka.util.Error.Severity.CRITICAL) {
      this._events.fatalErrorRetry(d);
    }
  };

  _shakaStallDetectedEvent = () => {
    if (this._player.getPlayerState().loaded) {
      this._events.loadingErrorEvents(true, false);
    }
  };
}
