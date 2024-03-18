import { ISource } from './types';
import { UI } from './ui';
import { Utils } from './utils';

export class NativePlayer {
  private ui: UI;

  constructor(ui: UI) {
    this.ui = ui;
  }

  init = async (video: HTMLVideoElement, source: ISource) => {
    Utils.urlCheck(source);
    video.src = source.url || '';
    return Promise.resolve();
  };

  destroy = async () => {
    this.ui.videoElement.src = '';
    this.ui.videoElement.load();
  };
}
