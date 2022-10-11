import Shaka from "shaka-player/dist/shaka-player.compiled.debug";
import { Events } from "../Events";
import { DRMEnums, IConfig, IPlayer, ISource, ShakaEventsEnum } from "../types";
import { isSafari } from "../Utils";

export class ShakaPlayer implements IPlayer {
  private _shaka: Shaka.Player;
  private _events: Events;

  constructor(events: Events) {
    this._events = events;
    this._shaka = new Shaka.Player();
    if (Shaka.Player.isBrowserSupported()) {
      Shaka.polyfill.installAll();
    } else {
      throw new Error("Shaka Player is not Supported.");
    }
  }

  urlCheck = (source: ISource) => {
    if (!source.url) return false;
    const isM3U8 = /.*(\.m3u8).*$/.test(source.url);
    const isMPD = /.*(\.m3u8).*$/.test(source.url);

    if (
      isM3U8 &&
      source.drm?.drmType === DRMEnums.FAIRPLAY &&
      !!source.drm?.certicateUrl &&
      !!source.drm?.licenseUrl
    ) {
      return true;
    }

    if (
      isMPD &&
      source.drm?.drmType === DRMEnums.WIDEVINE &&
      !!source.drm?.licenseUrl
    ) {
      return true;
    }

    return false;
  };

  initPlayer = async (
    mediaElement: HTMLMediaElement,
    source: ISource,
    config: IConfig,
    isVidgo: boolean
  ) => {
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
      if (isSafari() && source.drm?.drmType === DRMEnums.FAIRPLAY) {
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

        if (isVidgo) {
          this.vidgoResponseFilter();
        } else {
          this._shaka.getNetworkingEngine()?.clearAllResponseFilters();
        }
      }

      if (source.drm?.drmType === DRMEnums.WIDEVINE) {
        drmConfig = {
          drm: {
            servers: {
              "com.widevine.alpha": source.drm?.licenseUrl,
            },
          },
        };
      }

      this._shaka.configure({ ...drmConfig });

      this.addEvents();

      this._shaka
        .load(source.url || "", config.startTime)
        .then(async () => {
          try {
            await mediaElement.play();
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
    this._shaka.getNetworkingEngine()?.clearAllResponseFilters();
    this._shaka.getNetworkingEngine()?.registerResponseFilter((type, resp) => {
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

  destroy = async () => {
    await this._shaka.detach();
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
    if (d?.buffering) {
      this._events.loadingErrorEvents(true, false);
    } else {
      this._events.loadingErrorEvents(false, false);
    }
  };

  _shakaErrorEvent = (d: any) => {
    console.log("shaka-error-event", d);
    if (d?.severity === Shaka.util.Error.Severity.CRITICAL) {
      this._events.fatalErrorRetry(d);
    }
  };

  _shakaStallDetectedEvent = () => {
    this._events.loadingErrorEvents(true, false);
  };
}
