import { BrowsersEnum } from './types';
import { UI } from './ui';
import { Utils } from './utils';

export class AirPlay {
  private ui: UI;

  constructor(ui: UI) {
    this.ui = ui;
  }

  protected webkitPlaybackTargetAvailabilityChangedEvent = (
    airplay?: HTMLDivElement,
    video?: any,
  ) => {
    return (event: any) => {
      if (!airplay || !video) return;
      switch (event?.availability) {
        case 'available':
          airplay.innerHTML = Utils.Icons({
            type: 'airplay_enter',
          });
          airplay.classList.remove('none');
          airplay.onclick = () => {
            video.webkitShowPlaybackTargetPicker();
          };
          break;
        case 'not-available':
        default:
          airplay.innerHTML = '';
          airplay.classList.add('none');
          break;
      }
    };
  };

  protected webkitCurrentPlaybackTargetIsWirelessChangedEvent = (
    isLive: boolean,
    airplay?: HTMLDivElement,
    volume?: HTMLDivElement,
  ) => {
    return (event: any) => {
      if (!airplay || !volume) return;
      const state = event?.target?.remote?.state;
      if (state === 'connected') {
        airplay.innerHTML = Utils.Icons({
          type: 'airplay_exit',
        });
        Utils.toggleShowHide(volume, 'none');
        this.ui.player?.setPlayerState({ isAirplay: true });
        if (this.ui.player?.playerState.isPlaying && isLive) {
          this.ui.player.reloadPlayer().catch(() => console.log());
        }
      } else if (state === 'disconnected') {
        airplay.innerHTML = Utils.Icons({
          type: 'airplay_enter',
        });
        Utils.toggleShowHide(volume, 'flex');
        this.ui.player?.setPlayerState({ isAirplay: false });
        if (this.ui.player?.playerState.isPlaying && isLive) {
          this.ui.player.reloadPlayer().catch(() => console.log());
        }
      }
    };
  };

  init = () => {
    if (
      Utils.getBrowser() === BrowsersEnum.SAFARI &&
      (window as any).WebKitPlaybackTargetAvailabilityEvent
    ) {
      const video = this.ui.videoElement;
      const airplay = this.ui.controlsRemotePlaybackButton;
      const volume = this.ui.controlsVolumeWrapper;
      const isLive = Utils.isLive(this.ui);

      if (!video || !airplay || !volume) return;

      const webkitPlaybackTargetAvailabilityChanged =
        this.webkitPlaybackTargetAvailabilityChangedEvent(airplay, video);

      const webkitCurrentPlaybackTargetIsWirelessChanged =
        this.webkitCurrentPlaybackTargetIsWirelessChangedEvent(isLive, airplay, volume);

      video.addEventListener(
        'webkitplaybacktargetavailabilitychanged',
        webkitPlaybackTargetAvailabilityChanged,
      );

      video.addEventListener(
        'webkitcurrentplaybacktargetiswirelesschanged',
        webkitCurrentPlaybackTargetIsWirelessChanged,
      );
    }
  };
}
