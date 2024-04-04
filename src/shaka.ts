import Shaka from 'shaka-player/dist/shaka-player.compiled.debug';

import { BrowsersEnum, DRMEnums, ISource, PlayersEnum, ShakaEventsEnum } from './types';
import { UI } from './ui';
import { Utils } from './utils';

export class ShakaPlayer {
  ui: UI;
  player: shaka.Player | null = null;
  isSupported = false;
  contentId: string | null = null;
  url?: string = undefined;

  constructor(ui: UI) {
    this.ui = ui;
    this.player = new Shaka.Player();
    this.isSupported = Shaka.Player.isBrowserSupported();

    if (this.isSupported) {
      Shaka.polyfill.installAll();
    }
  }

  isLive = () => {
    return this.player?.isLive();
  };

  init = async (
    video: HTMLVideoElement,
    source: ISource,
    debug: boolean,
    mimeType: string,
    isVidgo: boolean,
  ) => {
    try {
      if (!this.isSupported) {
        console.log('Shaka not supported');
        return;
      }

      Utils.urlCheck(source);

      await this.player?.attach(video);

      this.ui.player.setPlayerState({ player: PlayersEnum.SHAKA });

      this.url = source.url;

      const isSafari = Utils.getBrowser() === BrowsersEnum.SAFARI;

      (Shaka as any).log.setLevel(
        debug ? (Shaka as any).log.Level.DEBUG : (Shaka as any).log.Level.NONE,
      );

      this.player?.resetConfiguration();
      this.player?.getNetworkingEngine()?.clearAllResponseFilters();
      this.player?.getNetworkingEngine()?.clearAllRequestFilters();

      this.addEvents();

      let drmConfig = {};

      const hasHeader = Utils.hasHeader(source.drm?.licenseHeader);

      if (isSafari && source.drm?.drmType === DRMEnums.FAIRPLAY) {
        if (isVidgo) {
          drmConfig = this.basicDrmConfigs(source);
          this.vidgoResponseFilter();
        } else if (hasHeader || source?.drm?.requireBase64Encoding) {
          drmConfig = this.basicDrmConfigs(source, false);
          this.buydrmFairplayRequestFilter(source);
          this.buyDrmFairplayResponseFilter();
        } else {
          drmConfig = this.basicDrmConfigs(source);
        }
      } else if (source.drm?.drmType === DRMEnums.WIDEVINE) {
        drmConfig = this.basicDrmConfigs(source);
        if (hasHeader) {
          this.buydrmWidevineRequestFilter(source);
        }
      }

      this.player?.configure({
        streaming: {
          alwaysStreamText: true,
          autoLowLatencyMode: true,
          jumpLargeGaps: true,
          lowLatencyMode: false,
          updateIntervalSeconds: 0.1,
          preferNativeHls: true,
          useNativeHlsOnSafari: true,
          stallEnabled: true,
          stallSkip: 0,
        },
        ...drmConfig,
      });

      this.player
        ?.load(this.url ?? '', null, mimeType)
        .then(() => {
          video.play().catch(() => console.log());
          video.currentTime = source.startTime ?? -1;
        })
        .catch(() => {});
    } catch (e) {
      console.log('shaka-init-error', e);
      this.ui.player.setPlayerState({ player: PlayersEnum.NONE });
      return Promise.reject();
    }
  };

  buydrmWidevineRequestFilter = (source: ISource) => {
    const filter = this.buydrmWidevineRequestFilterImpl(source);
    this.player?.getNetworkingEngine()?.registerRequestFilter(filter);
  };

  buydrmFairplayRequestFilter = (source: ISource) => {
    const filter = this.buydrmFairplayRequestFilterImpl(source);
    this.player?.getNetworkingEngine()?.registerRequestFilter(filter);
  };

  buyDrmFairplayResponseFilter = () => {
    const filter = this.buyDrmFairplayResponseFilterImpl();
    this.player?.getNetworkingEngine()?.registerResponseFilter(filter);
  };

  vidgoResponseFilter = () => {
    const filter = this.vidgoResponseFilterImpl();
    this.player?.getNetworkingEngine()?.registerResponseFilter(filter);
  };

  buydrmWidevineRequestFilterImpl = (source: ISource) => {
    return (type: Shaka.net.NetworkingEngine.RequestType, req: Shaka.extern.Request) => {
      if (type === Shaka.net.NetworkingEngine.RequestType.LICENSE) {
        req.headers = {
          ...req.headers,
          ...source.drm?.licenseHeader,
        };
      }
    };
  };

  buydrmFairplayRequestFilterImpl = (source: ISource) => {
    return (type: Shaka.net.NetworkingEngine.RequestType, req: Shaka.extern.Request) => {
      if (type === Shaka.net.NetworkingEngine.RequestType.LICENSE) {
        const originalPayload = new Uint8Array(req.body as any);
        const base64Payload = Shaka.util.Uint8ArrayUtils.toStandardBase64(originalPayload);
        const params = `spc=${base64Payload}&assetId=${this.contentId}`;
        req.headers = {
          ...req.headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          ...source.drm?.licenseHeader,
        };
        req.body = Shaka.util.StringUtils.toUTF8(params);
      }
    };
  };

  buyDrmFairplayResponseFilterImpl = () => {
    return (type: Shaka.net.NetworkingEngine.RequestType, resp: Shaka.extern.Response) => {
      if (type === Shaka.net.NetworkingEngine.RequestType.LICENSE) {
        let txt = Shaka.util.StringUtils.fromUTF8(resp.data);
        txt = txt.trim();
        if (txt.startsWith('<ckc>') && txt.endsWith('</ckc>')) {
          txt = txt.slice(5, -6);
        }
        resp.data = Shaka.util.Uint8ArrayUtils.fromBase64(txt).buffer;
      }
    };
  };

  vidgoResponseFilterImpl = () => {
    return (type: Shaka.net.NetworkingEngine.RequestType, resp: Shaka.extern.Response) => {
      if (type === Shaka.net.NetworkingEngine.RequestType.LICENSE) {
        const jsonResp = JSON.parse(
          String.fromCharCode.apply(null, new Uint8Array(resp.data as any) as any),
        );
        const raw = Buffer.from(jsonResp.ckc, 'base64');
        const rawLength = raw.length;
        const data = new Uint8Array(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i += 1) {
          data[i] = raw[i];
        }
        resp.data = data;
      }
    };
  };

  initDataTransformImpl = (initData: any, initDataType: any, drmInfo: any) => {
    if (initDataType !== 'skd') return initData;
    this.contentId = Shaka.util.FairPlayUtils.defaultGetContentId(initData);
    const cert = drmInfo.serverCertificate;
    return Shaka.util.FairPlayUtils.initDataTransform(initData, this.contentId, cert);
  };

  basicDrmConfigs = (source: ISource, lagacyFairplay = true) => {
    if (source.drm?.drmType === DRMEnums.WIDEVINE) {
      return {
        drm: {
          servers: {
            'com.widevine.alpha': source.drm?.licenseUrl,
          },
          advanced: {
            'com.widevine.alpha': {
              videoRobustness: 'SW_SECURE_CRYPTO',
              audioRobustness: 'SW_SECURE_CRYPTO',
            },
          },
        },
      };
    }

    if (source.drm?.drmType === DRMEnums.FAIRPLAY) {
      if (lagacyFairplay) {
        return {
          drm: {
            servers: {
              'com.apple.fps.1_0': source.drm?.licenseUrl,
            },
            advanced: {
              'com.apple.fps.1_0': {
                serverCertificateUri: source.drm?.certicateUrl,
              },
            },
          },
        };
      }

      return {
        drm: {
          servers: {
            'com.apple.fps': source.drm?.licenseUrl,
          },
          advanced: {
            'com.apple.fps': {
              serverCertificateUri: source.drm?.certicateUrl,
            },
          },
          initDataTransform: this.initDataTransformImpl,
        },
      };
    }

    return {};
  };

  reload = async () => {
    if (this.url) {
      try {
        await this.player?.load(this.url || '');
        return Promise.resolve();
      } catch (e) {
        Utils.fatelErrorRetry(this.ui);
        return Promise.reject(e);
      }
    }
  };

  destroy = async () => {
    await this.player?.detach();
    return Promise.resolve();
  };

  addEvents = () => {
    this.removeEvents();
    this.player?.addEventListener(ShakaEventsEnum.BUFFERING, this.shakaBufferingEvent.bind(this));
    this.player?.addEventListener(ShakaEventsEnum.ERROR, this.shakaErrorEvent.bind(this));
    this.player?.addEventListener(
      ShakaEventsEnum.STALL_DETECTED,
      this.shakaStallDetectedEvent.bind(this),
    );
  };

  removeEvents = () => {
    this.player?.removeEventListener(
      ShakaEventsEnum.BUFFERING,
      this.shakaBufferingEvent.bind(this),
    );
    this.player?.removeEventListener(ShakaEventsEnum.ERROR, this.shakaErrorEvent.bind(this));
    this.player?.removeEventListener(
      ShakaEventsEnum.STALL_DETECTED,
      this.shakaStallDetectedEvent.bind(this),
    );
  };

  shakaBufferingEvent = (d: any) => {
    if (this.ui.player.getPlayerState().loaded) {
      if (d?.buffering) {
        Utils.toggleWrappers({ ui: this.ui, loading: true });
      } else {
        Utils.toggleWrappers({ ui: this.ui, loading: false });
      }
    }
  };

  shakaErrorEvent = (d: any) => {
    console.log('shaka-error-event', d);
    Utils.fatelErrorRetry(this.ui);
  };

  shakaStallDetectedEvent = () => {
    if (this.ui.player.getPlayerState().loaded) {
      Utils.toggleWrappers({ ui: this.ui, loading: true });
    }
  };
}
