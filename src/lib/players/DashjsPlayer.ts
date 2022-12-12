import Dashjs from "dashjs";
import { Events } from "../Events";
import { MultiPlayer } from "../MultiPlayer";
import { DRMEnums, IConfig, IPlayer, ISource, MimeTypesEnum } from "../types";
import { _getMimeType } from "../Utils";

export class DashjsPlayer implements IPlayer {
  private _player: MultiPlayer;
  private _dashjs: Dashjs.MediaPlayerClass;
  private _events: Events;
  private _url: string | null = null;

  constructor(player: MultiPlayer, events: Events) {
    this._dashjs = Dashjs.MediaPlayer().create();
    this._dashjs.initialize();
    this._events = events;
    this._player = player;
  }

  urlCheck = (source: ISource) => {
    if (!source.url) return false;
    const url = _getMimeType(source.url) === MimeTypesEnum.MPD;
    const isDrm = source.drm?.drmType === DRMEnums.WIDEVINE;
    return isDrm ? url && !!source.drm?.licenseUrl : url;
  };

  initPlayer = async () => {
    const mediaElement = this._player.getMediaElement();
    const config = this._player.getCurrentConfig();
    const source = this._player.getSource();

    const check = this.urlCheck(source);
    if (mediaElement && check) {
      this._dashjs.attachView(mediaElement);
      this._dashjs.setAutoPlay(true);

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

      this._dashjs.enableForcedTextStreaming(true);

      this._dashjs.updateSettings({
        debug: {
          logLevel: config.debug
            ? (Dashjs as any).Debug.LOG_LEVEL_DEBUG
            : (Dashjs as any).Debug.LOG_LEVEL_NONE,
        },
        streaming: {
          metricsMaxListDepth: 1000,
          abandonLoadTimeout: 10000,
          liveDelayFragmentCount: NaN,
          liveDelay: undefined,
          scheduleWhilePaused: true,
          fastSwitchEnabled: false,
          flushBufferAtTrackSwitch: false,
          calcSegmentAvailabilityRangeFromTimeline: false,
          reuseExistingSourceBuffers: true,
          bufferPruningInterval: 10,
          bufferToKeep: 20,
          jumpGaps: true,
          jumpLargeGaps: true,
          smallGapLimit: 1.5,
          stableBufferTime: 30,
          bufferTimeAtTopQuality: 30,
          bufferTimeAtTopQualityLongForm: 60,
          longFormContentDurationThreshold: 600,
          wallclockTimeUpdateInterval: 50,
          lowLatencyEnabled: false,
          keepProtectionMediaKeys: false,
          useManifestDateHeaderTimeSource: true,
          useSuggestedPresentationDelay: true,
          useAppendWindow: true,
          manifestUpdateRetryInterval: 50,
          stallThreshold: 0.3,
          filterUnsupportedEssentialProperties: true,
          eventControllerRefreshDelay: 100,
          utcSynchronization: {
            backgroundAttempts: 2,
            timeBetweenSyncAttempts: 30,
            maximumTimeBetweenSyncAttempts: 600,
            minimumTimeBetweenSyncAttempts: 2,
            timeBetweenSyncAttemptsAdjustmentFactor: 2,
            maximumAllowedDrift: 100,
            enableBackgroundSyncAfterSegmentDownloadError: true,
            defaultTimingSource: {
              scheme: "urn:mpeg:dash:utc:http-xsdate:2014",
              value: "https://time.akamai.com/?iso&ms",
            },
          },
          liveCatchup: {
            minDrift: 0.02,
            maxDrift: 0,
            playbackRate: 0.5,
            latencyThreshold: NaN,
            playbackBufferMin: NaN,
            enabled: false,
            mode: "liveCatchupModeDefault",
          },
          lastBitrateCachingInfo: { enabled: true, ttl: 360000 },
          lastMediaSettingsCachingInfo: { enabled: true, ttl: 360000 },
          cacheLoadThresholds: { video: 50, audio: 5 },
          trackSwitchMode: {
            audio: "alwaysReplace",
            video: "alwaysReplace",
          },
          selectionModeForInitialTrack: "highestBitrate",
          fragmentRequestTimeout: 0,
          retryIntervals: {
            MPD: 500,
            XLinkExpansion: 500,
            InitializationSegment: 500,
            IndexSegment: 500,
            MediaSegment: 500,
            BitstreamSwitchingSegment: 500,
            FragmentInfoSegment: 500,
            other: 1000,
            lowLatencyReductionFactor: 10,
          },
          retryAttempts: {
            MPD: 0,
            XLinkExpansion: 2,
            InitializationSegment: 2,
            IndexSegment: 2,
            MediaSegment: 2,
            BitstreamSwitchingSegment: 2,
            FragmentInfoSegment: 2,
            other: 0,
            lowLatencyMultiplyFactor: 0,
          },
          abr: {
            movingAverageMethod: "slidingWindow",
            ABRStrategy: "abrDynamic",
            bandwidthSafetyFactor: 0.2,
            useDefaultABRRules: true,
            useDeadTimeLatency: true,
            limitBitrateByPortal: false,
            usePixelRatioInLimitBitrateByPortal: false,
            maxBitrate: { audio: -1, video: -1 },
            minBitrate: { audio: -1, video: -1 },
            maxRepresentationRatio: { audio: 1, video: 1 },
            initialBitrate: { audio: -1, video: -1 },
            initialRepresentationRatio: { audio: -1, video: -1 },
            autoSwitchBitrate: { audio: true, video: true },
            fetchThroughputCalculationMode:
              "abrFetchThroughputCalculationDownloadedData",
          },
          cmcd: {
            enabled: false,
            sid: undefined,
            cid: undefined,
            rtp: undefined,
            rtpSafetyFactor: 5,
            mode: "query",
          },
        },
      });

      this._dashjs.attachSource(source.url || "");

      this._url = source.url;

      this.addEvents();

      await Promise.resolve();
    }

    await Promise.reject();
  };

  destroy = async () => {
    try {
      this._dashjs.reset();
      await Promise.resolve();
    } catch (e) {}
  };

  stopLoad = () => {
    this._dashjs.updateSettings({ streaming: { scheduleWhilePaused: false } });
  };

  startLoad = () => {
    this._dashjs.updateSettings({ streaming: { scheduleWhilePaused: true } });
  };

  reload = async () => {
    if (this._url) {
      this._dashjs.attachSource(this._url);
      return Promise.resolve();
    }

    return Promise.reject();
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

  _dashjsErrorEvent = (d: any) => {
    console.log("dashjs - error", d);
    this._events.fatalErrorRetry(d);
  };

  _dashjsBufferLoadedEvent = () => {
    this._events.loadingErrorEvents(false, false);
  };

  _dashjsBufferEmptyEvent = () => {
    this._events.loadingErrorEvents(true, false);
  };
}
