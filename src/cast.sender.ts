import { BrowsersEnum, EventsEnum, STORAGE_KEYS } from './types';
import { UI } from './ui';
import { Utils } from './utils';

const MESSAGE_NAMESPACE = 'urn:x-cast:com.multiplayer.app';

export class CastingSender {
  ui: UI;
  androidReceiverCompatible = false;
  castReceiverId: string | null = null;
  hasReceivers = false;
  session: any = null;
  receiverName = '';
  apiReady = false;
  isCasting = false;
  seekTime = -1;
  playerCastingButton!: HTMLDivElement;
  isTextTrackVisible = false;
  loaded = false;
  stoppedForced = false;
  type?: 'channel' | 'catchup' | 'dvr' | 'vod' | null = null;

  constructor(ui: UI) {
    this.ui = ui;
  }

  /* c8 ignore start */
  load = () => {
    (window as any).__onGCastApiAvailable = (loaded: any) => {
      if (
        loaded &&
        (window as any)?.cast &&
        (window as any)?.chrome?.cast &&
        (window as any)?.cast?.framework
      ) {
        this.loaded = true;
      }
    };

    window.addEventListener('unload', () => {
      if (this.isCasting) {
        this.stopCasting();
      }
    });
  };
  /* c8 ignore stop */

  init = () => {
    if (Utils.getBrowser() !== BrowsersEnum.CHROME && Utils.getBrowser() !== BrowsersEnum.EDGE) {
      return;
    }

    this.playerCastingButton = this.ui.controlsRemotePlaybackButton;

    this.castReceiverId = this.ui.player.config.castReceiverId;

    if (!this.loaded) return;
    if (!this.castReceiverId) return;

    this.apiReady = true;

    if ((window as any)?.chrome?.cast?.SessionRequest) {
      const sessionRequest = new (window as any).chrome.cast.SessionRequest(
        this.castReceiverId,
        [],
        null,
        this.androidReceiverCompatible,
        null,
      );

      const apiConfig = new (window as any).chrome.cast.ApiConfig(
        sessionRequest,
        (session: any) => this.onSessionInitiated(session),
        (availability: any) => this.onReceiverStatusChange(availability),
        'origin_scoped',
      );

      (window as any).chrome.cast.initialize(
        apiConfig,
        () => this.onInitSuccess(),
        (error: any) => this.onInitError(error),
      );
    }
  };

  onInitSuccess = () => {
    console.log();
  };

  onInitError = (error: any) => {
    console.log('onInitError: ', error);
    this.hasReceivers = false;
    this.isCasting = false;
  };

  onSessionInitiated = (session: any) => {
    this.session = session;
    this.session.addUpdateListener(this.onConnectionStatusChanged.bind(this));
    this.session.addMessageListener(MESSAGE_NAMESPACE, (namespace: any, data: any) =>
      this.onMessageReceived(namespace, data),
    );
    this.onConnectionStatusChanged();
  };

  removeListeners = () => {
    if (this.session) {
      this.session.removeUpdateListener(this.onConnectionStatusChanged.bind(this));
      this.session.removeMessageListener(MESSAGE_NAMESPACE, (namespace: any, data: any) =>
        this.onMessageReceived(namespace, data),
      );
    }
  };

  onReceiverStatusChange = (availability: any) => {
    this.hasReceivers = availability === 'available';
    if (this.ui.player.isInitialized) {
      if (this.hasReceivers) {
        this.playerCastingButton.innerHTML = Utils.Icons({
          type: 'cast_enter',
        });
        this.playerCastingButton.classList.remove('none');
        this.playerCastingButton.onclick = this.cast.bind(this);
      } else {
        this.playerCastingButton.innerHTML = '';
        this.playerCastingButton.classList.add('none');
      }
    }
  };

  onConnectionStatusChanged = () => {
    const connected = this.session && this.session.status === 'connected';

    if (!this.isCasting && connected) {
      // connecting...
    }

    if (this.isCasting && !connected) {
      // discounting...
    }

    this.seekTime = this.ui.player.isInitialized ? this.ui.getVideoElement().currentTime : -1;
    this.isCasting = connected;
    this.receiverName = connected ? this.session.receiver.friendlyName : '';

    if (this.isCasting) {
      this.playerCastingButton.innerHTML = Utils.Icons({
        type: 'cast_exit',
      });
      this.ui.mainWrapper.classList.add('none');
      this.ui.player.removePlayer();
      setTimeout(() => {
        this.ui.player.setPlayerState({ isCasting: true });
        this.ui.addCastingUIElements();
        this.CastingUIBinds();
        this.stoppedForced = false;
      }, 300);
    } else {
      this.ui.player.setPlayerState({ isCasting: false });
      this.ui.removeCastingUIElements();
      if (this.stoppedForced) return;
      this.ui.player
        .init({
          elem: this.ui.container,
          source: this.ui.player.source,
          config: this.ui.player.config,
          contextLogoUrl: this.ui.contextLogoUrl,
          eventCallbacks: this.ui.player.eventCallbacks,
          onPauseCallback: this.ui.player.onPauseCallback,
          onPlayCallback: this.ui.player.onPlayCallback,
          onLeavePIPCallback: this.ui.player.onLeavePIPCallback,
          onEnterPIPCallback: this.ui.player.onEnterPIPCallback,
          onPlayerStateChange: this.ui.player.onPlayerStateChange,
        })
        .catch(() => {});
    }
  };

  CastingUIBinds = () => {
    this.ui.castingTitle.innerHTML = `Casting to <b>${this.receiverName}</b>`;
    this.ui.castingRemotePlaybackButton.onclick = this.cast.bind(this);
    this.ui.castingPlayPauseButton.onclick = this.onPlayPause.bind(this);
    this.ui.castingVolumeButtoon.onclick = this.onMuteUnMute.bind(this);
    this.ui.castingForwardButton.onclick = this.onForward.bind(this);
    this.ui.castingRewindButton.onclick = this.onRewind.bind(this);
    this.ui.castingRestartPlayButton.onclick = this.onRestartPlay.bind(this);
    this.ui.castingCloseCaptionButton.onclick = this.onTextTracksChange.bind(this);
  };

  onConnectionError = (error: any) => {
    if (error?.code === 'timeout') {
      this.stopCasting();
    }
  };

  stopCasting = () => {
    try {
      this.session.stop(
        () => {
          this.stoppedForced = true;
        },
        () => {
          this.stoppedForced = true;
        },
      );
    } catch (_err) {
      console.log();
    }
  };

  cast = () => {
    if (!this.apiReady) {
      console.log('error: ', 'api is not ready.');
      return;
    }

    if (!this.hasReceivers) {
      console.log('error: ', 'no receivers.');
      return;
    }

    (window as any).chrome.cast.requestSession(
      (session: any) => this.onSessionInitiated(session),
      (error: any) => this.onConnectionError(error),
    );
  };

  onMessageReceived = (_namespace: any, message: any) => {
    try {
      const msg = JSON.parse(message);

      const { type, data } = msg;

      switch (type) {
        case 'info': {
          const { currentTime } = data;
          sessionStorage.setItem(STORAGE_KEYS.VIDOE_CURRENT_TIME, String(Math.floor(currentTime)));
          break;
        }
        case 'player_loaded': {
          const { texts, variants } = data;
          /* c8 ignore next */
          this.ui.player.setPlayerState({ textTracks: texts || [] });
          /* c8 ignore next */
          this.ui.player.setPlayerState({ videoTracks: variants || [] });
          if (Array.isArray(texts) && texts.length) {
            this.ui.castingCloseCaptionButton.classList.remove('none');
          }
          break;
        }
        case 'player': {
          const { event, value } = data;
          switch (event) {
            case 'playing':
              this.ui.player.setPlayerState({ isPlaying: value });
              this.ui.castingPlayPauseButton.innerHTML = value
                ? Utils.Icons({ type: 'pause' })
                : Utils.Icons({ type: 'play' });
              break;
            case 'mute':
              this.ui.player.setPlayerState({ isMuted: value });
              this.ui.castingVolumeButtoon.innerHTML = value
                ? Utils.Icons({ type: 'volume_off' })
                : Utils.Icons({ type: 'volume_up' });
              break;
            case 'text-tracks':
              this.isTextTrackVisible = value;
              this.ui.castingCloseCaptionButton.innerHTML = value
                ? Utils.Icons({ type: 'cc_enabled' })
                : Utils.Icons({ type: 'cc_disabled' });
              break;
            case 'abort':
            case 'emptied':
            case 'ended':
              this.ui.castingPlayPauseButton.classList.add('none');
              this.ui.castingVolumeButtoon.classList.add('none');
              this.ui.castingForwardButton.classList.add('none');
              this.ui.castingRestartPlayButton.classList.add('none');
              this.ui.castingRewindButton.classList.add('none');
              this.ui.castingCloseCaptionButton.classList.add('none');
              break;
            case 'canplaythrough':
            case 'loadeddata':
              Utils.addEventCallback(this.ui, EventsEnum.LOADEDMETADATA);
              this.ui.castingPlayPauseButton.classList.remove('none');
              this.ui.castingVolumeButtoon.classList.remove('none');
              if (this.type !== 'channel') {
                this.ui.castingForwardButton.classList.remove('none');
                this.ui.castingRestartPlayButton.classList.remove('none');
                this.ui.castingRewindButton.classList.remove('none');
              }
              break;
            /* c8 ignore start */
            default:
              break;
          }
          break;
        }
        default:
          break;
        /* c8 ignore stop */
      }
    } catch (e) {
      console.log('onMessageReceived: ', 'error in parse', e);
    }
  };

  sendMessage = (data: any) => {
    const serialized = JSON.stringify(data);

    if (this.isCasting && this.session) {
      try {
        this.session.sendMessage(
          MESSAGE_NAMESPACE,
          serialized,
          () => {},
          (e: any) => console.log('sendMessage error: ', e),
        );
        /* c8 ignore start */
      } catch (e) {
        console.log('try sendMessage error', e);
      }
      /* c8 ignore stop */
    }
  };

  onPlayPause = () => {
    this.sendMessage({
      type: 'player',
      data: {
        event: 'playing',
        value: !this.ui.player.playerState.isPlaying,
      },
    });
    if (!this.ui.player.playerState.isPlaying) {
      this.ui.player?.onPlayCallback?.();
    } else {
      this.ui.player?.onPauseCallback?.();
    }
  };

  onMuteUnMute = () => {
    this.sendMessage({
      type: 'player',
      data: {
        event: 'mute',
        value: !this.ui.player.playerState.isMuted,
      },
    });
  };

  onForward = () => {
    this.sendMessage({
      type: 'player',
      data: {
        event: 'forward',
        value: 10,
      },
    });
  };

  onRewind = () => {
    this.sendMessage({
      type: 'player',
      data: {
        event: 'rewind',
        value: 10,
      },
    });
  };

  onRestartPlay = () => {
    this.sendMessage({
      type: 'player',
      data: {
        event: 'restart',
        value: true,
      },
    });
  };

  onTextTracksChange = () => {
    this.sendMessage({
      type: 'player',
      data: {
        event: 'text-tracks',
        value: !this.isTextTrackVisible,
      },
    });
  };

  sendSourceInfo = ({
    type,
    stream,
    vidgoToken,
    seekTime,
  }: {
    type?: 'channel' | 'catchup' | 'dvr' | 'vod' | null;
    stream?:
      | Array<{
          type?: string;
          data:
            | {
                media_url: string | undefined;
                drm_type: string | undefined;
                drm_details: {
                  server_url: string | undefined;
                  extra_headers: Record<string, string> | undefined;
                };
              }
            | string;
        }>
      | string
      | null;
    vidgoToken?: string | null;
    seekTime?: number | null;
  }) => {
    this.sendMessage({
      type: 'stream',
      data: {
        type,
        stream,
        seekTime,
        vidgoToken,
      },
    });
    this.type = type;
  };

  sendMediaInfo = ({
    vidTitle,
    description,
    logoUrl,
  }: {
    vidTitle?: string | null;
    description?: string | null;
    logoUrl?: string | null;
  }) => {
    this.sendMessage({
      type: 'media_info',
      data: {
        vidTitle,
        description,
        logoUrl,
      },
    });
  };

  sendRefreshToken = (token?: string) => {
    this.sendMessage({
      type: 'vidgo',
      data: { token },
    });
  };
}
