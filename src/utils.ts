/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  BrowsersEnum,
  EventsEnum,
  ISource,
  KEYBOARD_CODES,
  MimeTypesEnum,
  SETTINGS_CC_COLORS,
  SETTINGS_CC_OPACITY,
  SETTINGS_CC_TEXT_SIZE,
  SETTINGS_SUB_MENU,
  STORAGE_KEYS,
} from './types';
import { UI } from './ui';

export class Utils {
  static retryCount = 0;
  static fairPlayErrorCount = 0;
  static checkTextTracksTimer: NodeJS.Timeout | null = null;

  static async togglePlayPause(ui: UI) {
    ui.isContainerFocused = true;
    if (ui.player?.playerState.isCasting) {
      ui.player?.castSender.onPlayPause();
      return;
    }

    if (!ui.player?.playerState.loaded) return;

    if (ui.contextMenu?.style.display === 'block') {
      ui.contextMenu.style.display = 'none';
      return;
    }

    if (ui.optionsMenuWrapper?.classList.contains('flex')) {
      this.toggleShowHide(ui.optionsMenuWrapper, 'none');
      return;
    }

    const video = ui.videoElement;
    if (video && video.paused) {
      ui.player.hls.startLoad();
      await video.play();
      ui.player.setPlayerState({ hasUserPaused: false });
      if (typeof ui.player.onPlayCallback === 'function') {
        ui.player.onPlayCallback();
      }
    } else {
      ui.player.hls.stopLoad();
      if (video) video.pause();
      ui.player?.setPlayerState({ hasUserPaused: true });
      if (typeof ui.player.onPauseCallback === 'function') {
        ui.player?.onPauseCallback();
      }
    }
  }

  static toggleMuteUnMute(ui: UI) {
    ui.isContainerFocused = true;
    if (ui.player?.playerState.isCasting) {
      ui.player.castSender.onMuteUnMute();
      return;
    }

    if (!ui.player?.playerState.loaded) return;

    const video = ui.videoElement;
    if (video) {
      if (video.muted) {
        video.muted = false;
      } else {
        video.muted = true;
      }
    }
  }

  static toggleForwardRewind(ui: UI, forward: boolean) {
    if (ui.player?.playerState.isCasting) {
      if (forward) {
        ui.player.castSender.onForward();
      } else {
        ui.player.castSender.onRewind();
      }
      return;
    }

    if (!ui.player?.playerState.loaded) return;

    const video = ui.videoElement;
    if (video) {
      if (!video.duration) return;
      const ct = video.currentTime;
      const dt = video.duration;

      if (ct >= 0 && dt >= 0) {
        if (forward) {
          const v = Math.min(ct + 30, dt);
          ui.progressSliderValue = String(v);
          if (ui.controlsProgressRangeInput) ui.controlsProgressRangeInput.value = String(v);
          video.currentTime = v;
          return;
        }
        const v = Math.max(ct - 15, 0);
        ui.progressSliderValue = String(v);
        if (ui.controlsProgressRangeInput) ui.controlsProgressRangeInput.value = String(v);
        video.currentTime = v;
      }
    }
  }

  static seekTime(ui: UI, timeInSeconds: number) {
    ui.isContainerFocused = true;
    if (ui.player?.playerState.isCasting) return;
    if (!ui.player?.playerState.loaded) return;

    const video = ui.videoElement;
    if (video) {
      if (!video.duration || video.duration === Infinity) return;
      video.currentTime = timeInSeconds;
    }
  }

  static togglePip(ui: UI) {
    ui.isContainerFocused = true;
    if (ui.player?.playerState.isCasting) return;
    if (!ui.player?.playerState.loaded) return;

    const video = ui.videoElement;
    if (!document.pictureInPictureEnabled) return;
    if (this.isFullScreen()) {
      this.toggleFullScreen(ui);
    }
    if (!!video && video !== document.pictureInPictureElement) {
      video.requestPictureInPicture().catch(() => console.log());
    } else {
      document.exitPictureInPicture().catch(() => console.log());
    }
  }

  static toggleFullScreen(ui: UI) {
    ui.isContainerFocused = true;
    if (ui.player?.playerState.isCasting) return;
    if (!ui.player?.playerState.loaded) return;

    const video = ui.videoElement;
    const videoContainer = ui.mainWrapper;
    if (video === document.pictureInPictureElement) {
      this.togglePip(ui);
    }

    if ((document as any).fullscreenElement) {
      (document as any).exitFullscreen();
    } else if ((document as any).webkitFullscreenElement) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    } else if ((videoContainer as any).webkitRequestFullscreen) {
      (videoContainer as any).webkitRequestFullscreen();
    } else if ((videoContainer as any).requestFullscreen) {
      (videoContainer as any).requestFullscreen();
    } else if ((videoContainer as any).msRequestFullscreen) {
      (videoContainer as any).msRequestFullscreen();
    }
  }

  static fullScreenEvent(ui: UI) {
    if (ui.player?.playerState.isCasting) return;
    if (this.isFullScreen()) {
      if (ui.controlsFullScreen)
        ui.controlsFullScreen.innerHTML = this.Icons({
          type: 'fullscreen_exit',
        });
    } else {
      if (ui.controlsFullScreen)
        ui.controlsFullScreen.innerHTML = this.Icons({
          type: 'fullscreen_enter',
        });
    }
  }

  static onEndedReplay(ui: UI) {
    ui.isContainerFocused = true;
    if (ui.player?.playerState.isCasting) {
      ui.player.castSender.onRestartPlay();
      return;
    }

    if (!ui.player?.playerState.loaded) return;

    if (ui.videoElement) ui.videoElement.currentTime = 0;
    if (!ui.player?.playerState.isPlaying) {
      this.toggleWrappers({ ui, none: true });
      this.togglePlayPause(ui).catch(() => console.log());
    }
  }

  static isFullScreen() {
    if (
      (document as any).fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msExitFullscreen
    ) {
      return true;
    }
    return false;
  }

  static formatTime(timeInSeconds?: number) {
    if (Number.isNaN(timeInSeconds) || !Number.isFinite(timeInSeconds)) {
      return '00:00';
    }

    const t = timeInSeconds
      ? new Date(timeInSeconds * 1000).toISOString().substring(11, 19).split(':')
      : [];

    if (t.length === 3) {
      if (parseInt(t[0]) === 0) return `${t[1]}:${t[2]}`;
      if (parseInt(t[0]) > 0) return `${t[0]}:${t[1]}:${t[2]}`;
    }
    return '00:00';
  }

  static getBrowser() {
    const userAgent = navigator.userAgent;

    if (/edg/i.test(userAgent)) {
      return BrowsersEnum.EDGE;
    }

    if (
      (/chrome|crios/i.test(userAgent) &&
        !/opr|opera|chromium|edg|ucbrowser|googlebot/i.test(userAgent)) ||
      /chromium/i.test(userAgent)
    ) {
      return BrowsersEnum.CHROME;
    }

    if (/firefox|fxios/i.test(userAgent) && !/seamonkey/i.test(userAgent)) {
      return BrowsersEnum.FIREFOX;
    }

    if (/; msie|trident/i.test(userAgent) && !/ucbrowser/i.test(userAgent)) {
      return BrowsersEnum.IE;
    }

    if (
      /safari/i.test(userAgent) &&
      !/chromium|edg|ucbrowser|chrome|crios|opr|opera|fxios|firefox/i.test(userAgent)
    ) {
      return BrowsersEnum.SAFARI;
    }

    if (/opr|opera/i.test(userAgent)) {
      return BrowsersEnum.OPERA;
    }

    return BrowsersEnum.UNKNOWN;
  }

  static delay(ms = 0) {
    return new Promise((resolve) => setTimeout(() => resolve(true), ms));
  }

  static hasHeader(obj: unknown) {
    return (
      !!obj &&
      typeof obj === 'object' &&
      Object.keys(obj).length === 1 &&
      typeof Object.keys(obj)[0] === 'string' &&
      typeof Object.values(obj)[0] === 'string'
    );
  }

  static toggleShowHide(elem: HTMLElement | undefined, show: 'flex' | 'block' | 'none') {
    if (!elem) return;
    if (show === 'none') {
      elem.classList.remove('flex');
      elem.classList.remove('block');
      elem.classList.add('none');
      return;
    }

    if (show === 'block') {
      elem.classList.remove('none');
      elem.classList.remove('flex');
      elem.classList.add('block');
      return;
    }

    if (show === 'flex') {
      elem.classList.remove('none');
      elem.classList.remove('block');
      elem.classList.add('flex');
    }
  }

  static toggleOpacity(elem?: HTMLElement, show?: boolean) {
    if (elem) {
      if (show) {
        elem.classList.remove('opacity-0');
        elem.classList.add('opacity-1');
      } else {
        elem.classList.remove('opacity-1');
        elem.classList.add('opacity-0');
      }
    }
  }

  static toggleWrappers({
    ui,
    none,
    loading,
    error,
    ended,
    na,
  }: {
    ui: UI;
    none?: boolean;
    loading?: boolean;
    error?: boolean;
    ended?: boolean;
    na?: boolean;
  }) {
    const allNone = () => {
      this.toggleShowHide(ui.loaderWrapper, 'none');
      this.toggleShowHide(ui.errorWrapper, 'none');
      this.toggleShowHide(ui.endedWrapper, 'none');
      this.toggleShowHide(ui.contentNotAvailableWrapper, 'none');
      ui.player?.setPlayerState({
        uiState: 'none',
      });
    };

    if (none) {
      allNone();
      return;
    }

    if (loading) {
      allNone();
      this.toggleShowHide(ui.loaderWrapper, 'flex');
      ui.player?.setPlayerState({ uiState: 'loading' });
      return;
    }

    if (error) {
      allNone();
      this.toggleShowHide(ui.errorWrapper, 'flex');
      ui.player?.setPlayerState({ uiState: 'error' });
      return;
    }

    if (ended) {
      allNone();
      this.toggleShowHide(ui.endedWrapper, 'flex');
      ui.player?.setPlayerState({ uiState: 'ended' });
      return;
    }

    if (na) {
      allNone();
      this.toggleShowHide(ui.contentNotAvailableWrapper, 'flex');
    }
  }

  static fatelErrorRetry(ui: UI) {
    const maxCount = ui.player?.getConfig().maxRetryCount;
    console.log('RETRY #', this.retryCount, this.fairPlayErrorCount);

    if (this.retryCount === maxCount) {
      this.toggleWrappers({ ui, error: true });
      return;
    }

    this.toggleWrappers({ ui, loading: true });
    this.retryCount += 1;
    ui.player?.retry();
  }

  static resetRetryCounter() {
    this.retryCount = 0;
    this.fairPlayErrorCount = 0;
  }

  static async getMimeType(url?: string) {
    if (url) {
      try {
        if (/.*(\.mp4).*$/.test(url)) return MimeTypesEnum.MP4;
        if (/.*(\.webm).*$/.test(url)) return MimeTypesEnum.WEBM;
        if (/.*(\.ogg).*$/.test(url)) return MimeTypesEnum.OGG;
        if (/.*(\.ogv).*$/.test(url)) return MimeTypesEnum.OGG;
        if (/.*(\.m3u8).*$/.test(url)) return MimeTypesEnum.M3U8_1;
        if (/.*(\.mpd).*$/.test(url)) return MimeTypesEnum.MPD;

        const resp = await fetch(url, { method: 'HEAD' });
        const contentType = resp.headers.get('content-type');

        if (contentType) {
          if (contentType.includes(MimeTypesEnum.M3U8_1)) {
            return MimeTypesEnum.M3U8_1;
          }
          if (contentType.includes(MimeTypesEnum.M3U8_2)) {
            return MimeTypesEnum.M3U8_2;
          }
          if (contentType.includes(MimeTypesEnum.MPD)) return MimeTypesEnum.MPD;
        }

        return MimeTypesEnum.NONE;
      } catch (e) {
        return MimeTypesEnum.NONE;
      }
    }
    return MimeTypesEnum.NONE;
  }

  static urlCheck(source: ISource) {
    if (!source.url) {
      console.error(`Incorrect Source: ${JSON.stringify(source, null, 2)}`);
      return false;
    }
    return true;
  }

  static checkTextTracks(ui: UI) {
    if (ui.player?.getPlayerState().loaded) {
      if (this.checkTextTracksTimer) clearTimeout(this.checkTextTracksTimer);
      const tracks = ui.getVideoElement()?.textTracks;
      const tracksData: Array<any> = tracks
        ? Object.keys(tracks || {}).reduce((a: any, c: any) => {
            tracks[c].mode = 'hidden';
            return tracks[c].kind !== 'metadata' && !!Object.keys(tracks[c].cues || {}).length
              ? [
                  ...a,
                  {
                    id: c,
                    label: tracks[c].label,
                    lang: tracks[c].language,
                    track: tracks[c],
                  },
                ]
              : [...a];
          }, [])
        : [];

      if (!tracksData.length) {
        this.checkTextTracksTimer = setTimeout(() => this.checkTextTracks(ui), 500);
      } else {
        ui.player.setPlayerState({ textTracks: tracksData });
        ui.controlsCloseCaptionButton?.classList.remove('none');
        const id = sessionStorage.getItem(STORAGE_KEYS.CC_ID);
        if (id) this.setSelectedTextTrack(ui, id);
        this.setCloseCaptionButtonUI(ui);
      }
    }
  }

  static setCloseCaptionButtonUI(ui: UI) {
    if (ui.player?.playerState.selectedTextTrackId) {
      if (ui.controlsCloseCaptionButton)
        ui.controlsCloseCaptionButton.innerHTML = this.Icons({
          type: 'cc_enabled',
        });
    } else {
      if (ui.controlsCloseCaptionButton)
        ui.controlsCloseCaptionButton.innerHTML = this.Icons({
          type: 'cc_disabled',
        });
    }
  }

  static isLive(ui: UI) {
    if (ui.videoElement?.duration === Infinity || ui.player?.shaka.isLive()) {
      return true;
    }
    return false;
  }

  static onVolumeSliderChange(ui: UI, e: any) {
    const { value } = e.target;
    ui.volumeSliderValue = value;
    const volume = Number(value);
    const video = ui.videoElement;
    if (video) {
      video.volume = volume;
      if (volume > 0) {
        if (video.muted) {
          video.muted = false;
        }
      } else {
        video.muted = true;
      }
    }
  }

  static onVideoProgressChange(ui: UI, e: any) {
    const { value } = e.target;
    ui.progressSliderValue = value;
    if (ui.videoElement) ui.videoElement.currentTime = Number(value);
  }

  static sliderColorValue(slider: HTMLInputElement) {
    if (!slider) return;
    const value =
      ((Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min))) *
      100;
    slider.style.background = `linear-gradient(to right, #1C6FEE 0%, #1C6FEE ${value}%, rgba(240, 240, 240, 0.4) ${value}%, rgba(240, 240, 240, 0.4) 100%)`;
  }

  static enterPIP(ui: UI, callback?: () => void) {
    if (ui.controlsPIP) ui.controlsPIP.innerHTML = this.Icons({ type: 'pip_exit' });
    if (typeof callback === 'function') callback();
  }

  static leavePIP(ui: UI, callback?: () => void) {
    if (ui.controlsPIP) ui.controlsPIP.innerHTML = this.Icons({ type: 'pip_enter' });
    if (typeof callback === 'function') callback();
  }

  static setSelectedTextTrack(ui: UI, trackId: string | null) {
    ui.optionsMenuState = SETTINGS_SUB_MENU.NONE;
    this.toggleShowHide(ui.optionsMenuWrapper, 'none');
    if (trackId === ui.player?.playerState.selectedTextTrackId) return;
    ui.player?.setPlayerState({ selectedTextTrackId: trackId });
    this.setCloseCaptionButtonUI(ui);
    this.toggleTextTracks(ui, trackId);
  }

  static activeCuesEvent = (ui: UI) => {
    return (e: any) => {
      let text: any[] = [];
      const cues = e?.target?.activeCues;

      if (Object.keys(cues || {})?.length) {
        text = Object.keys(cues).reduce((a: any, c: any) => {
          return [...a, cues[c].text];
        }, []);
      }

      this.resetCloseCaptionContainer(ui);

      const container = ui.closeCaptionsContainer;
      if (container) {
        if (text?.length) {
          text.forEach((txt) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'close-caption';
            wrapper.id = 'close-caption';
            wrapper.innerHTML = txt;
            container.appendChild(wrapper);
          });
          this.setCloseCaptionStyles(ui, {}, Utils.isFullScreen());
          container.style.display = 'flex';
        }
      }
    };
  };

  static toggleTextTracks(ui: UI, trackId: string | null) {
    const tracks = ui.player?.playerState.textTracks;
    this.resetCloseCaptionContainer(ui);

    const cuesEvent = this.activeCuesEvent(ui);

    if (tracks?.length) {
      tracks.forEach((t) => {
        t.track.removeEventListener('cuechange', cuesEvent, true);
      });
      if (trackId) {
        Object.keys(ui.videoElement?.textTracks || {}).forEach((t: any) => {
          if (ui.videoElement) ui.videoElement.textTracks[t].mode = 'disabled';
        });
        Object.keys(ui.videoElement?.textTracks || {}).forEach((t: any) => {
          if (ui.videoElement) ui.videoElement.textTracks[t].mode = 'hidden';
        });
        tracks[trackId as any].track.addEventListener('cuechange', cuesEvent, true);
      } else {
        Object.keys(ui.videoElement?.textTracks || {}).forEach((t: any) => {
          if (ui.videoElement) ui.videoElement.textTracks[t].mode = 'disabled';
        });
      }
    }
  }

  static resetCloseCaptionContainer = (ui: UI) => {
    const container = ui.closeCaptionsContainer;
    if (container) {
      container.style.display = 'none';
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };

  static setCloseCaptionStyles(
    ui: UI,
    styles: {
      textSize?: number;
      textColor?: string;
      bgColor?: string;
      bgOpacity?: number;
    } = {},
    isFullScreen = false,
  ) {
    const storedStyled = localStorage.getItem(STORAGE_KEYS.CC_STYLES);
    let storedStyledPased = {};
    if (storedStyled) {
      storedStyledPased = JSON.parse(storedStyled);
    }
    const values = {
      textSize: SETTINGS_CC_TEXT_SIZE.Default,
      textColor: SETTINGS_CC_COLORS.Default,
      bgColor: SETTINGS_CC_COLORS.Default,
      bgOpacity: SETTINGS_CC_OPACITY.Default,
      ...storedStyledPased,
      ...styles,
    };

    localStorage.setItem(STORAGE_KEYS.CC_STYLES, JSON.stringify({ ...values }));

    const elems = ui.closeCaptionsContainer?.getElementsByClassName(
      'close-caption',
    ) as HTMLCollectionOf<HTMLDivElement>;

    if (elems?.length) {
      // text color
      if (values.textColor === SETTINGS_CC_COLORS.Default) {
        for (let i = 0, len = elems.length; i < len; i++) {
          elems[i].style.color = `rgb(${SETTINGS_CC_COLORS.White})`;
        }
      } else {
        for (let i = 0, len = elems.length; i < len; i++) {
          elems[i].style.color = `rgb(${values.textColor})`;
        }
      }

      // bg color & opacity
      for (let i = 0, len = elems.length; i < len; i++) {
        elems[i].style.backgroundColor = `rgba(${
          values.bgColor === 'default' ? SETTINGS_CC_COLORS.Black : values.bgColor
        },${values.bgOpacity === 'default' ? SETTINGS_CC_OPACITY['100%'] : values.bgOpacity})`;
      }

      // text size
      if (values.textSize === SETTINGS_CC_TEXT_SIZE.Default) {
        for (let i = 0, len = elems.length; i < len; i++) {
          elems[i].style.fontSize = isFullScreen
            ? `${SETTINGS_CC_TEXT_SIZE['100%'] + 1}rem`
            : `${SETTINGS_CC_TEXT_SIZE['100%']}rem`;
        }
      } else {
        for (let i = 0, len = elems.length; i < len; i++) {
          elems[i].style.fontSize = isFullScreen
            ? `${Number(values.textSize) + 1}rem`
            : `${Number(values.textSize)}rem`;
        }
      }
    }
  }

  static getCloseCaptionStyles() {
    const storedStyled = localStorage.getItem(STORAGE_KEYS.CC_STYLES);
    let storedStyledPased: {
      textSize?: string;
      textColor?: string;
      bgColor?: string;
      bgOpacity?: string;
    } = {};
    if (storedStyled) {
      storedStyledPased = JSON.parse(storedStyled);
    }
    const textSize = Object.keys(SETTINGS_CC_TEXT_SIZE).find(
      // @ts-ignore
      (k) => SETTINGS_CC_TEXT_SIZE[k] === storedStyledPased.textSize,
    );

    const textColor = Object.keys(SETTINGS_CC_COLORS).find(
      // @ts-ignore
      (k) => SETTINGS_CC_COLORS[k] === storedStyledPased.textColor,
    );

    const bgColor = Object.keys(SETTINGS_CC_COLORS).find(
      // @ts-ignore
      (k) => SETTINGS_CC_COLORS[k] === storedStyledPased.bgColor,
    );

    const bgOpacity = Object.keys(SETTINGS_CC_OPACITY).find(
      // @ts-ignore
      (k) => SETTINGS_CC_OPACITY[k] === storedStyledPased.bgOpacity,
    );

    return { textColor, textSize, bgColor, bgOpacity };
  }

  static isCastSenderFrameworkAvailable() {
    return (
      (window as any)?.cast && (window as any)?.chrome?.cast && (window as any)?.cast?.framework
    );
  }

  static addEventCallback = (ui: UI, event: EventsEnum) => {
    if (ui.player?.eventCallbacks?.length) {
      const idx = ui.player.eventCallbacks.findIndex((e) => (e.event as EventsEnum) === event);
      if (idx !== -1) {
        const call = ui.player.eventCallbacks[idx];
        if (typeof call.callback === 'function') call.callback();
      }
    }
  };

  static keyDownEvents = (ui: UI, event: any) => {
    if (ui.isContainerFocused) {
      event.preventDefault();

      if (event?.code === KEYBOARD_CODES.SPACE_KEY) {
        this.togglePlayPause(ui);
      }
      if (event?.code === KEYBOARD_CODES.ARROW_UP_KEY) {
        if (ui.player?.playerState.isCasting) {
          ui.player.castSender.onMuteUnMute();
          return;
        }
        const currentVolume = Number(Number(ui.volumeSliderValue).toFixed(1));
        if (currentVolume < 1) {
          this.onVolumeSliderChange(ui, { target: { value: currentVolume + 0.1 } });
        }
      }
      if (event?.code === KEYBOARD_CODES.ARROW_DOWN_KEY) {
        if (ui.player?.playerState.isCasting) {
          ui.player.castSender.onMuteUnMute();
          return;
        }
        const currentVolume = Number(Number(ui.volumeSliderValue).toFixed(1));
        if (currentVolume > 0) {
          this.onVolumeSliderChange(ui, { target: { value: currentVolume - 0.1 } });
        }
      }
      if (event?.code === KEYBOARD_CODES.ARROW_LEFT_KEY) {
        if (this.isLive(ui)) return;
        this.toggleForwardRewind(ui, false);
      }
      if (event?.code === KEYBOARD_CODES.ARROW_RIGHT_KEY) {
        if (this.isLive(ui)) return;
        this.toggleForwardRewind(ui, true);
      }
    }
  };

  static Icons({
    type,
    iconSize = '24px',
    fill = '#fff',
  }: {
    type:
      | 'pause'
      | 'play'
      | 'volume_up'
      | 'volume_off'
      | 'volume_down'
      | 'cast_enter'
      | 'cast_exit'
      | 'airplay_enter'
      | 'airplay_exit'
      | 'fullscreen_enter'
      | 'fullscreen_exit'
      | 'pip_enter'
      | 'pip_exit'
      | 'settings'
      | 'cc_enabled'
      | 'cc_disabled'
      | 'arrow_back'
      | 'replay'
      | 'forward'
      | 'rewind'
      | 'none';
    iconSize?: string;
    fill?: string;
  }) {
    switch (type) {
      case 'play':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 5v14l11-7L8 5z"/></svg>`;
      case 'pause':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      case 'volume_up':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
      case 'volume_down':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`;
      case 'volume_off':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.34-.3 2.57-.92 3.61-1.75l2.05 2.05 1.41-1.41L4.34 2.93zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-7-8l-1.88 1.88L12 7.76zm4.5 8c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>`;
      case 'cast_enter':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M23 3H1v5h2V5h18v14h-7v2h9V3zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/></svg>`;
      case 'cast_exit':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm22-7H1v5h2V5h18v14h-7v2h9V3z"/></svg>`;
      case 'airplay_exit':
      case 'airplay_enter':
        return `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><path d="M6,22h12l-6-6L6,22z M23,3H1v16h6v-2H3V5h18v12h-4v2h6V3z"/></g></svg>`;
      case 'fullscreen_enter':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
      case 'fullscreen_exit':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
      case 'pip_enter':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 11h-8v6h8v-6zm4 10V3H1v18h22zm-2-1.98H3V4.97h18v14.05z"/></svg>`;
      case 'pip_exit':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M23 3H1v18h22V3zm-2 16h-9v-6h9v6z"/></svg>`;
      case 'settings':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.44 12.99l-.01.02c.04-.33.08-.67.08-1.01 0-.34-.03-.66-.07-.99l.01.02 2.44-1.92-2.43-4.22-2.87 1.16.01.01c-.52-.4-1.09-.74-1.71-1h.01L14.44 2H9.57l-.44 3.07h.01c-.62.26-1.19.6-1.71 1l.01-.01-2.88-1.17-2.44 4.22 2.44 1.92.01-.02c-.04.33-.07.65-.07.99 0 .34.03.68.08 1.01l-.01-.02-2.1 1.65-.33.26 2.43 4.2 2.88-1.15-.02-.04c.53.41 1.1.75 1.73 1.01h-.03L9.58 22h4.85s.03-.18.06-.42l.38-2.65h-.01c.62-.26 1.2-.6 1.73-1.01l-.02.04 2.88 1.15 2.43-4.2s-.14-.12-.33-.26l-2.11-1.66zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
      case 'cc_enabled':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 4H3v16h18V4zm-10 7H9.5v-.5h-2v3h2V13H11v2H6V9h5v2zm7 0h-1.5v-.5h-2v3h2V13H18v2h-5V9h5v2z"/></svg>`;
      case 'cc_disabled':
        return `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><rect fill="none" height="24" width="24"/><path d="M6.83,4H21v14.17L17.83,15H18v-2h-1.5v0.5h-0.17l-1.83-1.83V10.5h2V11H18V9h-5v1.17L6.83,4z M19.78,22.61L17.17,20H3V5.83 L1.39,4.22l1.41-1.41l18.38,18.38L19.78,22.61z M11,13.83L10.17,13H9.5v0.5h-2v-3h0.17L6.17,9H6v6h5V13.83z"/></svg>`;
      case 'arrow_back':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/></svg>`;
      case 'replay':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`;
      case 'rewind':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0z" fill="none"/><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`;
      case 'forward':
        return `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0z" fill="none"/><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`;
      default:
        return ``;
    }
  }
}
