import Hls from 'hls.js/dist/hls.min';

import { ISource } from './types';
import { UI } from './ui';
import { Utils } from './utils';

export class HlsPlayer {
  private ui: UI;
  player: typeof Hls | null = null;
  isHlsStopped = false;

  constructor(ui: UI) {
    this.ui = ui;
  }

  init = async (video: HTMLVideoElement, source: ISource, debug: boolean) => {
    if (!Hls.isSupported()) {
      console.error('HLS not supported.');
      return Promise.reject();
    }

    Utils.urlCheck(source);

    if (!this.player) {
      this.player = new Hls({
        ...Hls.DefaultConfig,
        debug,
        startPosition: source.startTime ?? -1,
        liveDurationInfinity: true,
        enableWorker: true,
        // lowLatencyMode: true,
        // backBufferLength: 30,
        maxBufferLength: 30,
        // maxMaxBufferLength: 300,
        maxBufferSize: 3e7,
        // maxLoadingDelay: 1,
        // maxBufferLength: 10,
        // maxMaxBufferLength: 300,
        // maxBufferSize: 30 * 1000 * 1000,
        // liveSyncDurationCount: 1,
        // progressive: true,
      });
    }

    this.player.attachMedia(video);

    this.player.on(Hls.Events.MEDIA_ATTACHED, () => {
      this.player.loadSource(source.url ?? '');
    });

    this.addEvents();

    return Promise.resolve();
  };

  destroy = async () => {
    if (this.player) {
      this.player.stopLoad();
      this.player.detachMedia();
      this.player.destroy();
      this.player = null;
    }
    return Promise.resolve();
  };

  startLoad = (startPosition?: number) => {
    if (this.player && this.isHlsStopped) {
      this.player.startLoad(startPosition);
      this.isHlsStopped = false;
    }
  };

  stopLoad = () => {
    if (this.player) {
      this.player.stopLoad();
      this.isHlsStopped = true;
    }
  };

  addEvents = () => {
    if (this.player) {
      this.player.on(Hls.Events.ERROR, this.errorEvent.bind(this));
    }
  };

  removeEvents = () => {
    if (this.player) {
      this.player.removeAllListeners();
    }
  };

  errorEvent = (e: any, d: any) => {
    console.log('hls-error', e, d);
    if (d?.details === 'bufferStalledError') {
      Utils.toggleWrappers({ ui: this.ui, loading: true });
    }

    if (d?.fatal) {
      Utils.fatelErrorRetry(this.ui);
    }
  };
}
