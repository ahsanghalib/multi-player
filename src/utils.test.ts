import { waitFor } from '@testing-library/dom';
import { Window } from 'happy-dom';

import {
  BrowsersEnum,
  EventsEnum,
  MimeTypesEnum,
  SETTINGS_CC_COLORS,
  SETTINGS_CC_OPACITY,
  SETTINGS_CC_TEXT_SIZE,
  SETTINGS_SUB_MENU,
  STORAGE_KEYS,
} from './types';
import { Utils as originalUtils } from './utils';

const orignalDocument = { ...document };
const originalNavigator = { ...navigator };

global.fetch = vi.fn();

function createFetchResponse(contentType?: MimeTypesEnum) {
  return {
    ok: true,
    json: vi.fn(() => ({})),
    headers: {
      get: vi.fn(() => {
        return contentType;
      }),
    },
  };
}

const onPlayPauseMock = vi.fn();
const onMuteUnMuteMock = vi.fn();
const onForwardMock = vi.fn();
const onRewindMock = vi.fn();
const classListRemoveMock = vi.fn();
const classListAddMock = vi.fn();
const hlsStartLoadMock = vi.fn();
const hlsStopLoadMock = vi.fn();
const videoPlayMock = vi.fn();
const videoPauseMock = vi.fn();
const setPlayerStateMock = vi.fn();
const onPlayCallbackMock = vi.fn();
const onPauseCallbackMock = vi.fn();
const requestPictureInPictureMock = vi.fn(() => ({ catch: vi.fn() }));
const exitPictureInPictureMock = vi.fn(() => ({ catch: vi.fn() }));
const exitFullscreenMock = vi.fn();
const webkitExitFullscreenMock = vi.fn();
const msExitFullscreenMock = vi.fn();
const webkitRequestFullscreenMock = vi.fn();
const requestFullscreenMock = vi.fn();
const msRequestFullscreenMock = vi.fn();
const onRestartPlayMock = vi.fn();
const retryMock = vi.fn();
const toggleWrappersMock = vi.fn();
const toggleShowHideMock = vi.fn();
const callbackMock = vi.fn();
const setCloseCaptionButtonUIMock = vi.fn();
const toggleTextTracksMock = vi.fn();
const resetCloseCaptionContainerMock = vi.fn();
const setCloseCaptionStylesMock = vi.fn();
const removeEventListenerMock = vi.fn();
const addEventListenerMock = vi.fn();
const appendChildMock = vi.fn();
const removeChildMock = vi.fn();
const videoElement = {};

const Utils = originalUtils;

describe('utils.ts', () => {
  test('togglePlayPause - isCasting true', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
        },
        castSender: {
          onPlayPause: onPlayPauseMock,
        },
      },
    }));

    const ui = new UI();
    Utils.togglePlayPause(ui as any);
    expect(onPlayPauseMock).toHaveBeenCalledTimes(1);
  });

  test('togglePlayPause - isCasting false', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
        },
        castSender: {
          onPlayPause: onPlayPauseMock,
        },
      },
    }));

    const ui = new UI();
    Utils.togglePlayPause(ui as any);
    expect(onPlayPauseMock).toHaveBeenCalledTimes(0);
  });

  test('togglePlayPause - hide context menu', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      contextMenu: {
        style: {
          display: 'block',
        },
      },
    }));

    const ui = new UI();
    Utils.togglePlayPause(ui as any);
    expect(ui.contextMenu.style.display).toBe('none');
  });

  test('togglePlayPause - hide options menu', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      contextMenu: {
        style: {
          display: 'none',
        },
      },
      optionsMenuWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
    }));

    const ui = new UI();
    Utils.togglePlayPause(ui as any);
    expect(classListRemoveMock).toHaveBeenCalledTimes(2);
    expect(classListAddMock).toHaveBeenCalledTimes(1);
  });

  test('togglePlayPause - if video paused', async () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
        setPlayerState: setPlayerStateMock,
        hls: {
          startLoad: hlsStartLoadMock,
          stopLoad: hlsStopLoadMock,
        },
        onPlayCallback: onPlayCallbackMock,
        onPauseCallback: onPauseCallbackMock,
      },
      contextMenu: {
        style: {
          display: 'none',
        },
      },
      optionsMenuWrapper: {
        classList: {
          contains: vi.fn(() => false),
        },
      },
      videoElement: {
        paused: true,
        play: videoPlayMock,
        pause: videoPauseMock,
      },
    }));

    const ui = new UI();
    Utils.togglePlayPause(ui as any);
    expect(hlsStartLoadMock).toHaveBeenCalledTimes(1);
    expect(videoPlayMock).toHaveBeenCalledTimes(1);
    expect(videoPauseMock).toHaveBeenCalledTimes(0);
    await waitFor(() => {
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(onPlayCallbackMock).toHaveBeenCalledTimes(1);
    });
  });

  test('togglePlayPause - if video playing', async () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
        setPlayerState: setPlayerStateMock,
        hls: {
          startLoad: hlsStartLoadMock,
          stopLoad: hlsStopLoadMock,
        },
        onPlayCallback: onPlayCallbackMock,
        onPauseCallback: onPauseCallbackMock,
      },
      contextMenu: {
        style: {
          display: 'none',
        },
      },
      optionsMenuWrapper: {
        classList: {
          contains: vi.fn(() => false),
        },
      },
      videoElement: {
        paused: false,
        play: videoPlayMock,
        pause: videoPauseMock,
      },
    }));

    const ui = new UI();
    Utils.togglePlayPause(ui as any);
    expect(hlsStartLoadMock).toHaveBeenCalledTimes(0);
    expect(hlsStopLoadMock).toHaveBeenCalledTimes(1);
    expect(videoPlayMock).toHaveBeenCalledTimes(0);
    expect(videoPauseMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(onPauseCallbackMock).toHaveBeenCalledTimes(1);
  });

  test('toggleMuteUnMute - isCasting true', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
        },
        castSender: {
          onMuteUnMute: onMuteUnMuteMock,
        },
      },
      videoElement: {
        muted: true,
      },
    }));

    const ui = new UI();
    Utils.toggleMuteUnMute(ui as any);
    expect(onMuteUnMuteMock).toHaveBeenCalledTimes(1);
  });

  test('toggleMuteUnMute - isCasting false', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
        },
        castSender: {
          onMuteUnMute: onMuteUnMuteMock,
        },
      },
      videoElement: {
        muted: true,
      },
    }));

    const ui = new UI();
    Utils.toggleMuteUnMute(ui as any);
    expect(onMuteUnMuteMock).toHaveBeenCalledTimes(0);
  });

  test('toggleMuteUnMute - if video muted', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          loaded: true,
        },
      },
      videoElement: {
        muted: true,
      },
    }));

    const ui = new UI();
    Utils.toggleMuteUnMute(ui as any);
    expect(ui.videoElement.muted).toBe(false);
  });

  test('toggleMuteUnMute - if video muted false', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          loaded: true,
        },
      },
      videoElement: {
        muted: false,
      },
    }));

    const ui = new UI();
    Utils.toggleMuteUnMute(ui as any);
    expect(ui.videoElement.muted).toBe(true);
  });

  test('toggleForwardRewind - isCasting true - forward true', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
        },
        castSender: {
          onForward: onForwardMock,
          onRewind: onRewindMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleForwardRewind(ui as any, true);
    expect(onForwardMock).toHaveBeenCalledTimes(1);
    expect(onRewindMock).toHaveBeenCalledTimes(0);
  });

  test('toggleForwardRewind - isCasting true - forward false', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
        },
        castSender: {
          onForward: onForwardMock,
          onRewind: onRewindMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleForwardRewind(ui as any, false);
    expect(onForwardMock).toHaveBeenCalledTimes(0);
    expect(onRewindMock).toHaveBeenCalledTimes(1);
  });

  test('toggleForwardRewind - if duration undefined return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        duration: null,
      },
    }));

    const ui = new UI();
    Utils.toggleForwardRewind(ui as any, false);
    expect(ui.player.playerState.loaded).toBe(true);
  });

  test('toggleForwardRewind - forward true', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        duration: 100,
        currentTime: 10,
      },
    }));

    const ui = new UI();
    Utils.toggleForwardRewind(ui as any, true);
    expect(ui.videoElement.currentTime).toBe(40);
  });

  test('toggleForwardRewind - if current time & duration are same return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        duration: 100,
        currentTime: 100,
      },
    }));

    const ui = new UI();
    Utils.toggleForwardRewind(ui as any, true);
    expect(ui.videoElement.currentTime).toBe(100);
  });

  test('toggleForwardRewind - forward false', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        duration: 100,
        currentTime: 100,
      },
    }));

    const ui = new UI();
    Utils.toggleForwardRewind(ui as any, false);
    expect(ui.videoElement.currentTime).toBe(85);
  });

  test('seekTime - if duration null return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          loaded: true,
        },
      },
      videoElement: {
        currentTime: 0,
      },
    }));

    const ui = new UI();
    Utils.seekTime(ui as any, 10);
    expect(ui.videoElement.currentTime).toBe(0);
  });

  test('seekTime', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          loaded: true,
        },
      },
      videoElement: {
        duration: 100,
        currentTime: 0,
      },
    }));

    const ui = new UI();
    Utils.seekTime(ui as any, 10);
    expect(ui.videoElement.currentTime).toBe(10);
  });

  test('togglePip - if casting return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
          loaded: false,
        },
      },
      videoElement: {},
    }));

    const ui = new UI();
    Utils.togglePip(ui as any);
  });

  test('togglePip - if not in pip and not enabled return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        requestPictureInPicture: requestPictureInPictureMock,
      },
    }));

    (document as any).pictureInPictureEnabled = false;

    const ui = new UI();
    Utils.togglePip(ui as any);
    expect(requestPictureInPictureMock).toHaveBeenCalledTimes(0);
    document = { ...orignalDocument };
  });

  test('togglePip - if not in pip call requestPictureInPicture', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        requestPictureInPicture: requestPictureInPictureMock,
        exitPictureInPicture: exitPictureInPictureMock,
      },
    }));

    (document as any).pictureInPictureEnabled = true;

    const ui = new UI();
    Utils.togglePip(ui as any);
    expect(requestPictureInPictureMock).toHaveBeenCalledTimes(1);
    expect(exitPictureInPictureMock).toHaveBeenCalledTimes(0);
    document = { ...orignalDocument };
  });

  test('togglePip - if not in pip call requestPictureInPicture & if full screen toggle full screen', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement: {
        requestPictureInPicture: requestPictureInPictureMock,
      },
    }));

    (document as any).pictureInPictureEnabled = true;
    (document as any).fullscreenElement = true;
    (document as any).exitFullscreen = exitFullscreenMock;

    const ui = new UI();
    Utils.togglePip(ui as any);
    expect(exitFullscreenMock).toHaveBeenCalledTimes(1);
    expect(requestPictureInPictureMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('togglePip - if in pip call exitPictureInPicture', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
    }));

    (document as any).pictureInPictureEnabled = true;
    (document as any).pictureInPictureElement = videoElement;
    (document as any).exitPictureInPicture = exitPictureInPictureMock;

    const ui = new UI();
    Utils.togglePip(ui as any);
    expect(exitPictureInPictureMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if casting & not loaded return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
          loaded: false,
        },
      },
      videoElement,
    }));

    (document as any).fullscreenElement = true;
    (document as any).exitFullscreen = exitFullscreenMock;

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(exitFullscreenMock).toHaveBeenCalledTimes(0);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if pip call toggle pip', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: undefined,
        requestFullscreen: undefined,
        msRequestFullscreen: undefined,
      },
    }));

    (document as any).pictureInPictureEnabled = true;
    (document as any).pictureInPictureElement = videoElement;
    (document as any).exitPictureInPicture = exitPictureInPictureMock;
    (document as any).fullscreenElement = false;
    (document as any).webkitRequestFullscreen = false;
    (document as any).msExitFullscreen = false;

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(exitPictureInPictureMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if full screen element call exitFullscreen', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: undefined,
        requestFullscreen: undefined,
        msRequestFullscreen: undefined,
      },
    }));

    (document as any).fullscreenElement = true;
    (document as any).exitFullscreen = exitFullscreenMock;

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(exitFullscreenMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if webkitFullscreenElement', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: undefined,
        requestFullscreen: undefined,
        msRequestFullscreen: undefined,
      },
    }));

    (document as any).webkitFullscreenElement = true;
    (document as any).webkitExitFullscreen = webkitExitFullscreenMock;

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(webkitExitFullscreenMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if msExitFullscreen', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: undefined,
        requestFullscreen: undefined,
        msRequestFullscreen: undefined,
      },
    }));

    (document as any).msExitFullscreen = msExitFullscreenMock;

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(msExitFullscreenMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if webkitRequestFullscreen', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: webkitRequestFullscreenMock,
        requestFullscreen: requestFullscreenMock,
        msRequestFullscreen: msRequestFullscreenMock,
      },
    }));

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(webkitRequestFullscreenMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if requestFullscreen', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: undefined,
        requestFullscreen: requestFullscreenMock,
        msRequestFullscreen: msRequestFullscreenMock,
      },
    }));

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('toggleFullScreen - if msRequestFullscreen', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
        },
      },
      videoElement,
      mainWrapper: {
        webkitRequestFullscreen: undefined,
        requestFullscreen: undefined,
        msRequestFullscreen: msRequestFullscreenMock,
      },
    }));

    const ui = new UI();
    Utils.toggleFullScreen(ui as any);
    expect(msRequestFullscreenMock).toHaveBeenCalledTimes(1);
    document = { ...orignalDocument };
  });

  test('fullScreenEvent - if casting return', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
        },
      },
    }));

    const ui = new UI();
    Utils.fullScreenEvent(ui as any);
  });

  test('fullScreenEvent - full screen enter', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
        },
      },
      controlsFullScreen: {
        innerHTML: '',
      },
    }));

    const ui = new UI();
    Utils.fullScreenEvent(ui as any);
    expect(ui.controlsFullScreen.innerHTML).toBe(Utils.Icons({ type: 'fullscreen_enter' }));
  });

  test('fullScreenEvent - full screen exit', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
        },
      },
      controlsFullScreen: {
        innerHTML: '',
      },
    }));

    (document as any).fullscreenElement = true;

    const ui = new UI();
    Utils.fullScreenEvent(ui as any);
    expect(ui.controlsFullScreen.innerHTML).toBe(Utils.Icons({ type: 'fullscreen_exit' }));
    document = { ...orignalDocument };
  });

  test('onEndedReplay - if casting call onRestartPlay', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: true,
        },
        castSender: {
          onRestartPlay: onRestartPlayMock,
        },
      },
    }));

    const ui = new UI();
    Utils.onEndedReplay(ui as any);
    expect(onRestartPlayMock).toHaveBeenCalledTimes(1);
  });

  test('onEndedReplay - if casting call onRestartPlay', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          isCasting: false,
          loaded: true,
          isPlaying: false,
        },
        setPlayerState: setPlayerStateMock,
      },
      videoElement: {
        currentTime: 0,
      },
      loaderWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      errorWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      endedWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contentNotAvailableWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contextMenu: {
        style: {
          display: 'block',
        },
      },
    }));

    const ui = new UI();
    Utils.onEndedReplay(ui as any);
    expect(ui.loaderWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.loaderWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.errorWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.errorWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.endedWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.endedWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.contentNotAvailableWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.contentNotAvailableWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.contextMenu.style.display).toBe('none');
  });

  test('isFullScreen - true', () => {
    (document as any).fullscreenElement = true;
    expect(Utils.isFullScreen()).toBe(true);
    document = { ...orignalDocument };
  });

  test('isFullScreen - false', () => {
    (document as any).fullscreenElement = false;
    expect(Utils.isFullScreen()).toBe(false);
    document = { ...orignalDocument };
  });

  test('formatTime', () => {
    expect(Utils.formatTime()).toBe('00:00');
    expect(Utils.formatTime(200)).toBe('03:20');
    expect(Utils.formatTime(5000)).toBe('01:23:20');
    expect(Utils.formatTime(0)).toBe('00:00');
    expect(Utils.formatTime()).toBe('00:00');
  });

  test.skip('getBrowser', () => {
    (navigator as any).userAgent = 'edge';
    expect(Utils.getBrowser()).toBe(BrowsersEnum.EDGE);
    (navigator as any).userAgent = 'chrome';
    expect(Utils.getBrowser()).toBe(BrowsersEnum.CHROME);
    (navigator as any).userAgent = 'firefox';
    expect(Utils.getBrowser()).toBe(BrowsersEnum.FIREFOX);
    (navigator as any).userAgent = '; msie';
    expect(Utils.getBrowser()).toBe(BrowsersEnum.IE);
    (navigator as any).userAgent = 'safari';
    expect(Utils.getBrowser()).toBe(BrowsersEnum.SAFARI);
    (navigator as any).userAgent = 'opera';
    expect(Utils.getBrowser()).toBe(BrowsersEnum.OPERA);
    (navigator as any).userAgent = undefined;
    expect(Utils.getBrowser()).toBe(BrowsersEnum.UNKNOWN);
    navigator = { ...originalNavigator };
    document = { ...orignalDocument };
  });

  test('delay', async () => {
    await Utils.delay(1000);
    expect(true).toBe(true);
  });

  test('hasHeader', () => {
    expect(Utils.hasHeader({})).toBe(false);
    expect(Utils.hasHeader({ header: null })).toBe(false);
    expect(Utils.hasHeader({ header: {} })).toBe(false);
    expect(Utils.hasHeader({ header: 'header' })).toBe(true);
  });

  test('toggleShowHide', () => {
    const window = new Window();
    const document = window.document;
    const elem = document.createElement('div');

    Utils.toggleShowHide(elem as any, 'none');
    expect(elem.className).toBe('none');

    Utils.toggleShowHide(elem as any, 'block');
    expect(elem.className).toBe('block');

    Utils.toggleShowHide(elem as any, 'flex');
    expect(elem.className).toBe('flex');
  });

  test('toggleOpacity', () => {
    const window = new Window();
    const document = window.document;
    const elem = document.createElement('div');

    Utils.toggleOpacity(elem as any, true);
    expect(elem.className).toBe('opacity-1');

    Utils.toggleOpacity(elem as any, false);
    expect(elem.className).toBe('opacity-0');
  });

  test('toggleWrappers - none', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      loaderWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      errorWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      endedWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contentNotAvailableWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleWrappers({ ui: ui as any, none: true });
    expect(ui.loaderWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.loaderWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.errorWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.errorWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.endedWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.endedWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(ui.contentNotAvailableWrapper.classList.remove).toHaveBeenCalledTimes(8);
    expect(ui.contentNotAvailableWrapper.classList.add).toHaveBeenCalledTimes(4);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
  });

  test('toggleWrappers - loading', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      loaderWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      errorWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      endedWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contentNotAvailableWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleWrappers({ ui: ui as any, loading: true });
    expect(ui.loaderWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.loaderWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.errorWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.errorWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.endedWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.endedWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.contentNotAvailableWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.contentNotAvailableWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(2);
  });

  test('toggleWrappers - error', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      loaderWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      errorWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      endedWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contentNotAvailableWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleWrappers({ ui: ui as any, error: true });
    expect(ui.loaderWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.loaderWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.errorWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.errorWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.endedWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.endedWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.contentNotAvailableWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.contentNotAvailableWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(2);
  });

  test('toggleWrappers - ended', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      loaderWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      errorWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      endedWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contentNotAvailableWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleWrappers({ ui: ui as any, ended: true });
    expect(ui.loaderWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.loaderWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.errorWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.errorWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.endedWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.endedWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.contentNotAvailableWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.contentNotAvailableWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(2);
  });

  test('toggleWrappers - na', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      loaderWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      errorWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      endedWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
      contentNotAvailableWrapper: {
        classList: {
          contains: vi.fn(() => true),
          remove: classListRemoveMock,
          add: classListAddMock,
        },
      },
    }));

    const ui = new UI();
    Utils.toggleWrappers({ ui: ui as any, na: true });
    expect(ui.loaderWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.loaderWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.errorWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.errorWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.endedWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.endedWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(ui.contentNotAvailableWrapper.classList.remove).toHaveBeenCalledTimes(10);
    expect(ui.contentNotAvailableWrapper.classList.add).toHaveBeenCalledTimes(5);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
  });

  test('fatelErrorRetry', () => {
    const UI = vi.fn(() => ({
      toggleWrappers: vi.fn(),
      player: {
        setPlayerState: setPlayerStateMock,
        retry: retryMock,
        getConfig: vi.fn(() => ({
          maxRetryCount: 3,
        })),
      },
    }));

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const ui = new UI();
    Utils.fatelErrorRetry(ui as any);
    expect(Utils.retryCount).toBe(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(retryMock).toHaveBeenCalledTimes(1);

    Utils.fatelErrorRetry(ui as any);
    expect(Utils.retryCount).toBe(2);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(2);
    expect(retryMock).toHaveBeenCalledTimes(2);

    Utils.fatelErrorRetry(ui as any);
    expect(Utils.retryCount).toBe(3);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(3);
    expect(retryMock).toHaveBeenCalledTimes(3);

    Utils.fatelErrorRetry(ui as any);
    expect(Utils.retryCount).toBe(3);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(4);
    expect(retryMock).toHaveBeenCalledTimes(3);

    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('resetRetryCounter', () => {
    Utils.retryCount = 3;
    Utils.fairPlayErrorCount = 3;

    Utils.resetRetryCounter();

    expect(Utils.retryCount).toBe(0);
    expect(Utils.fairPlayErrorCount).toBe(0);
  });

  test('getMimeType - none', async () => {
    let result = await Utils.getMimeType();
    expect(result).toBe(MimeTypesEnum.NONE);
    (fetch as any).mockResolvedValue(createFetchResponse());
    result = await Utils.getMimeType('https://test.stream.url');
    expect(result).toBe(MimeTypesEnum.NONE);
  });

  test('getMimeType - mp4', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url.mp4');
    expect(result).toBe(MimeTypesEnum.MP4);
  });

  test('getMimeType - webm', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url.webm');
    expect(result).toBe(MimeTypesEnum.WEBM);
  });

  test('getMimeType - ogg', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url.ogg');
    expect(result).toBe(MimeTypesEnum.OGG);
  });

  test('getMimeType - ogv', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url.ogv');
    expect(result).toBe(MimeTypesEnum.OGG);
  });

  test('getMimeType - m3u8', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url.m3u8');
    expect(result).toBe(MimeTypesEnum.M3U8_1);
  });

  test('getMimeType - mpd', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url.mpd');
    expect(result).toBe(MimeTypesEnum.MPD);
  });

  test('getMimeType - based on fetch value m3u8_1', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse(MimeTypesEnum.M3U8_1));
    const result = await Utils.getMimeType('https://test.stream.url');
    expect(result).toBe(MimeTypesEnum.M3U8_1);
  });

  test('getMimeType - based on fetch value m3u8_2', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse(MimeTypesEnum.M3U8_2));
    const result = await Utils.getMimeType('https://test.stream.url');
    expect(result).toBe(MimeTypesEnum.M3U8_2);
  });

  test('getMimeType - based on fetch value mpd', async () => {
    (fetch as any).mockResolvedValue(createFetchResponse(MimeTypesEnum.MPD));
    const result = await Utils.getMimeType('https://test.stream.url');
    expect(result).toBe(MimeTypesEnum.MPD);
  });

  test('getMimeType - based on fetch rejected', async () => {
    (fetch as any).mockRejectedValue(createFetchResponse());
    const result = await Utils.getMimeType('https://test.stream.url');
    expect(result).toBe(MimeTypesEnum.NONE);
  });

  test('urlCheck', () => {
    expect(
      Utils.urlCheck({
        url: 'https://test.stream.url',
      }),
    ).toBe(true);
    expect(Utils.urlCheck({ url: undefined, drm: undefined, startTime: undefined })).toBe(false);
  });

  test('checkTextTracks - if text tracks are undefined', () => {
    const UI = vi.fn(() => ({
      player: {
        getPlayerState: vi.fn(() => ({
          loaded: true,
        })),
      },
      getVideoElement: vi.fn(() => ({
        textTracks: null,
      })),
    }));
    const ui = new UI();
    expect(Utils.checkTextTracks(ui as any)).toBe(undefined);
  });

  test('checkTextTracks - if text tracks are available', () => {
    const UI = vi.fn(() => ({
      player: {
        getPlayerState: vi.fn(() => ({
          loaded: true,
        })),
        playerState: {
          selectedTextTrackId: '0',
        },
        setPlayerState: setPlayerStateMock,
      },
      controlsCloseCaptionButton: {
        classList: {
          remove: classListRemoveMock,
        },
        innerHTML: '',
      },
      getVideoElement: vi.fn(() => ({
        textTracks: {
          '0': {
            kind: 'cc',
            mode: 'showing',
            label: 'en',
            id: 0,
            lang: 'english',
            cues: { '0': { startTime: 0, endTime: 1, text: 'test' } },
          },
          '1': {
            kind: 'cc',
            mode: 'showing',
            label: 'en',
            id: 0,
            lang: 'english',
            cues: {},
          },
        },
      })),
    }));
    const ui = new UI();
    Utils.checkTextTracks(ui as any);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(classListRemoveMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsCloseCaptionButton.innerHTML).toBe(Utils.Icons({ type: 'cc_enabled' }));
  });

  test('setCloseCaptionButtonUI - enabled', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          selectedTextTrackId: '0',
        },
      },
      controlsCloseCaptionButton: {
        classList: {
          remove: classListRemoveMock,
        },
        innerHTML: '',
      },
    }));
    const ui = new UI();
    Utils.setCloseCaptionButtonUI(ui as any);
    expect(ui.controlsCloseCaptionButton.innerHTML).toBe(Utils.Icons({ type: 'cc_enabled' }));
  });

  test('setCloseCaptionButtonUI - disabled', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          selectedTextTrackId: null,
        },
      },
      controlsCloseCaptionButton: {
        classList: {
          remove: classListRemoveMock,
        },
        innerHTML: '',
      },
    }));
    const ui = new UI();
    Utils.setCloseCaptionButtonUI(ui as any);
    expect(ui.controlsCloseCaptionButton.innerHTML).toBe(Utils.Icons({ type: 'cc_disabled' }));
  });

  test('isLive - duration is infinity', () => {
    const UI = vi.fn(() => ({
      videoElement: {
        duration: Infinity,
      },
      player: {
        shaka: {
          isLive: vi.fn(() => false),
        },
      },
    }));

    const ui = new UI();
    expect(Utils.isLive(ui as any)).toBe(true);
  });

  test('isLive - shaka player is live', () => {
    const UI = vi.fn(() => ({
      videoElement: {
        duration: null,
      },
      player: {
        shaka: {
          isLive: vi.fn(() => true),
        },
      },
    }));

    const ui = new UI();
    expect(Utils.isLive(ui as any)).toBe(true);
  });

  test('isLive - false', () => {
    const UI = vi.fn(() => ({
      videoElement: {
        duration: null,
      },
      player: {
        shaka: {
          isLive: vi.fn(() => false),
        },
      },
    }));

    const ui = new UI();
    expect(Utils.isLive(ui as any)).toBe(false);
  });

  test('onVolumeSliderChange', () => {
    const UI = vi.fn(() => ({
      volumeSliderValue: 0,
      videoElement: {
        volume: 0,
        muted: true,
      },
    }));

    const ui = new UI();

    let e: any = {
      target: {
        value: 10,
      },
    };

    Utils.onVolumeSliderChange(ui as any, e as any);
    expect(ui.volumeSliderValue).toBe(10);
    expect(ui.videoElement.muted).toBe(false);

    e = {
      target: {
        value: 0,
      },
    };

    Utils.onVolumeSliderChange(ui as any, e as any);
    expect(ui.volumeSliderValue).toBe(0);
    expect(ui.videoElement.muted).toBe(true);
  });

  test('onVideoProgressChange', () => {
    const UI = vi.fn(() => ({
      progressSliderValue: 0,
      videoElement: {
        currentTime: 0,
      },
    }));

    const ui = new UI();

    const e: any = {
      target: {
        value: 10,
      },
    };

    Utils.onVideoProgressChange(ui as any, e as any);
    expect(ui.progressSliderValue).toBe(10);
  });

  test('sliderColorValue', () => {
    const slider = {
      value: '50',
      min: '0',
      max: '100',
      style: {
        background: null,
      },
    };

    Utils.sliderColorValue(slider as any);
    expect(slider.style.background).toEqual(
      'linear-gradient(to right, #1C6FEE 0%, #1C6FEE 50%, rgba(240, 240, 240, 0.4) 50%, rgba(240, 240, 240, 0.4) 100%)',
    );
  });

  test('enterPIP', () => {
    const UI = vi.fn(() => ({
      controlsPIP: {
        innerHTML: '',
      },
    }));

    const ui = new UI();
    Utils.enterPIP(ui as any, callbackMock);
    expect(ui.controlsPIP.innerHTML).toBe(Utils.Icons({ type: 'pip_exit' }));
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  test('leavePIP', () => {
    const UI = vi.fn(() => ({
      controlsPIP: {
        innerHTML: '',
      },
    }));

    const ui = new UI();
    Utils.leavePIP(ui as any, callbackMock);
    expect(ui.controlsPIP.innerHTML).toBe(Utils.Icons({ type: 'pip_enter' }));
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  test('setSelectedTextTrack - trackId is already selected', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
        playerState: {
          selectedTextTrackId: '0',
        },
      },
      optionsMenuState: SETTINGS_SUB_MENU.CC,
    }));

    const ui = new UI();

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    Utils.setSelectedTextTrack(ui as any, '0');

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.NONE);
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(0);
    Utils.toggleShowHide = originalToggleShowHide;
  });

  test('setSelectedTextTrack - select a new track id', () => {
    const UI = vi.fn(() => ({
      player: {
        setPlayerState: setPlayerStateMock,
        playerState: {
          selectedTextTrackId: '0',
        },
      },
      optionsMenuState: SETTINGS_SUB_MENU.CC,
    }));

    const ui = new UI();

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const originalSetCloseCaptionButtonUI = Utils.setCloseCaptionButtonUI;
    Utils.setCloseCaptionButtonUI = setCloseCaptionButtonUIMock;

    const originalToggleTextTracks = Utils.toggleTextTracks;
    Utils.toggleTextTracks = toggleTextTracksMock;

    Utils.setSelectedTextTrack(ui as any, '1');

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.NONE);
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setCloseCaptionButtonUIMock).toHaveBeenCalledTimes(1);
    expect(toggleTextTracksMock).toHaveBeenCalledTimes(1);

    Utils.toggleShowHide = originalToggleShowHide;
    Utils.setCloseCaptionButtonUI = originalSetCloseCaptionButtonUI;
    Utils.toggleTextTracks = originalToggleTextTracks;
  });

  test('activeCuesEvent', () => {
    const window = new Window();
    vi.stubGlobal('document', window.document);

    const UI = vi.fn(() => ({
      closeCaptionsContainer: {
        style: {
          display: 'none',
        },
        appendChild: appendChildMock,
      },
    }));

    const event = {
      target: {
        activeCues: {
          '0': {
            text: 'first',
          },
          '1': {
            text: 'second',
          },
        },
      },
    };

    const ui = new UI();
    const cueEvent = Utils.activeCuesEvent(ui as any);

    const originalSetCloseCaptionStyles = Utils.setCloseCaptionStyles;
    Utils.setCloseCaptionStyles = setCloseCaptionStylesMock;

    const originalResetCloseCaptionContainer = Utils.resetCloseCaptionContainer;
    Utils.resetCloseCaptionContainer = resetCloseCaptionContainerMock;

    cueEvent(event as any);

    expect(setCloseCaptionStylesMock).toHaveBeenCalledTimes(1);
    expect(resetCloseCaptionContainerMock).toHaveBeenCalledTimes(1);
    expect(appendChildMock).toHaveBeenCalledTimes(2);
    expect(ui.closeCaptionsContainer.style.display).toBe('flex');

    Utils.setCloseCaptionStyles = originalSetCloseCaptionStyles;
    Utils.resetCloseCaptionContainer = originalResetCloseCaptionContainer;
  });

  test('toggleTextTracks - if tracks are empty', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          textTracks: [],
        },
      },
      closeCaptionsContainer: {
        style: {
          display: 'none',
        },
      },
    }));

    const ui = new UI();

    const originalResetCloseCaptionContainer = Utils.resetCloseCaptionContainer;
    Utils.resetCloseCaptionContainer = resetCloseCaptionContainerMock;

    const originalSetCloseCaptionStyles = Utils.setCloseCaptionStyles;
    Utils.setCloseCaptionStyles = setCloseCaptionStylesMock;

    Utils.toggleTextTracks(ui as any, '0');

    expect(resetCloseCaptionContainerMock).toHaveBeenCalledTimes(1);
    expect(setCloseCaptionStylesMock).toHaveBeenCalledTimes(0);

    Utils.resetCloseCaptionContainer = originalResetCloseCaptionContainer;
    Utils.setCloseCaptionStyles = originalSetCloseCaptionStyles;
  });

  test('toggleTextTracks - if track id is null', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          textTracks: [
            {
              track: {
                removeEventListener: removeEventListenerMock,
                addEventListener: addEventListenerMock,
              },
            },
          ],
        },
      },
      closeCaptionsContainer: {
        style: {
          display: 'none',
        },
      },
      videoElement: {
        textTracks: {
          '0': {
            kind: 'cc',
            mode: 'showing',
            label: 'en',
            id: 0,
            lang: 'english',
            cues: { '0': { startTime: 0, endTime: 1, text: 'test' } },
          },
          '1': {
            kind: 'cc',
            mode: 'showing',
            label: 'en',
            id: 0,
            lang: 'english',
            cues: {},
          },
        },
      },
    }));

    const ui = new UI();

    const originalResetCloseCaptionContainer = Utils.resetCloseCaptionContainer;
    Utils.resetCloseCaptionContainer = resetCloseCaptionContainerMock;

    Utils.toggleTextTracks(ui as any, null);

    expect(resetCloseCaptionContainerMock).toHaveBeenCalledTimes(1);
    expect(removeEventListenerMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledTimes(0);
    expect(ui.videoElement.textTracks[0].mode).toBe('disabled');
    expect(ui.videoElement.textTracks[1].mode).toBe('disabled');

    Utils.resetCloseCaptionContainer = originalResetCloseCaptionContainer;
  });

  test('toggleTextTracks', () => {
    const UI = vi.fn(() => ({
      player: {
        playerState: {
          textTracks: [
            {
              track: {
                removeEventListener: removeEventListenerMock,
                addEventListener: addEventListenerMock,
              },
            },
          ],
        },
      },
      closeCaptionsContainer: {
        style: {
          display: 'none',
        },
      },
      videoElement: {
        textTracks: {
          '0': {
            kind: 'cc',
            mode: 'showing',
            label: 'en',
            id: 0,
            lang: 'english',
            cues: { '0': { startTime: 0, endTime: 1, text: 'test' } },
          },
          '1': {
            kind: 'cc',
            mode: 'showing',
            label: 'en',
            id: 0,
            lang: 'english',
            cues: {},
          },
        },
      },
    }));

    const ui = new UI();

    const originalResetCloseCaptionContainer = Utils.resetCloseCaptionContainer;
    Utils.resetCloseCaptionContainer = resetCloseCaptionContainerMock;

    Utils.toggleTextTracks(ui as any, '0');

    expect(resetCloseCaptionContainerMock).toHaveBeenCalledTimes(1);
    expect(removeEventListenerMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    expect(ui.videoElement.textTracks[0].mode).toBe('hidden');
    expect(ui.videoElement.textTracks[1].mode).toBe('hidden');

    Utils.resetCloseCaptionContainer = originalResetCloseCaptionContainer;
  });

  test('resetCloseCaptionContainer', () => {
    const UI = vi.fn(() => ({
      closeCaptionsContainer: {
        style: {
          display: 'flex',
        },
        firstChild: true,
        removeChild: removeChildMock,
      },
    }));

    const ui = new UI();

    ui.closeCaptionsContainer.removeChild.mockImplementation(() => {
      ui.closeCaptionsContainer.firstChild = false;
    });

    Utils.resetCloseCaptionContainer(ui as any);

    expect(removeChildMock).toHaveBeenCalledTimes(1);
    expect(ui.closeCaptionsContainer.style.display).toBe('none');
  });

  test('setCloseCaptionStyles - if default', () => {
    const values = {
      textSize: SETTINGS_CC_TEXT_SIZE.Default,
      textColor: SETTINGS_CC_COLORS.Default,
      bgColor: SETTINGS_CC_COLORS.Default,
      bgOpacity: SETTINGS_CC_OPACITY.Default,
    };

    localStorage.setItem(STORAGE_KEYS.CC_STYLES, JSON.stringify({ ...values }));

    const UI = vi.fn(() => ({
      closeCaptionsContainer: {
        getElementsByClassName: vi.fn().mockReturnValue([
          {
            style: {
              color: '',
              backgroundColor: '',
              fontSize: '',
            },
          },
        ]),
      },
    }));
    const ui = new UI();
    Utils.setCloseCaptionStyles(ui as any, {}, false);

    expect(ui.closeCaptionsContainer.getElementsByClassName).toHaveBeenCalledTimes(1);
    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.color).toBe(
      `rgb(${SETTINGS_CC_COLORS.White})`,
    );
    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.fontSize).toBe(
      `${SETTINGS_CC_TEXT_SIZE['100%']}rem`,
    );
    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.backgroundColor).toBe(
      `rgba(${SETTINGS_CC_COLORS.Black},${SETTINGS_CC_OPACITY['100%']})`,
    );
  });

  test('setCloseCaptionStyles - if full screen & default', () => {
    const UI = vi.fn(() => ({
      closeCaptionsContainer: {
        getElementsByClassName: vi.fn().mockReturnValue([
          {
            style: {
              color: '',
              backgroundColor: '',
              fontSize: '',
            },
          },
        ]),
      },
    }));

    const ui = new UI();

    Utils.setCloseCaptionStyles(ui as any, {}, true);

    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.fontSize).toBe(
      `${SETTINGS_CC_TEXT_SIZE['100%'] + 1}rem`,
    );
  });

  test('setCloseCaptionStyles - if full screen & not default', () => {
    const UI = vi.fn(() => ({
      closeCaptionsContainer: {
        getElementsByClassName: vi.fn().mockReturnValue([
          {
            style: {
              color: '',
              backgroundColor: '',
              fontSize: '',
            },
          },
        ]),
      },
    }));

    const ui = new UI();

    Utils.setCloseCaptionStyles(
      ui as any,
      {
        textSize: 2,
      },
      true,
    );

    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.fontSize).toBe(
      `${SETTINGS_CC_TEXT_SIZE['200%'] + 1}rem`,
    );
  });

  test('setCloseCaptionStyles', () => {
    const UI = vi.fn(() => ({
      closeCaptionsContainer: {
        getElementsByClassName: vi.fn().mockReturnValue([
          {
            style: {
              color: '',
              backgroundColor: '',
              fontSize: '',
            },
          },
        ]),
      },
    }));

    const ui = new UI();

    Utils.setCloseCaptionStyles(
      ui as any,
      {
        textSize: 2,
        textColor: '0, 0, 255',
        bgColor: '255, 0, 0',
        bgOpacity: 0.2,
      },
      false,
    );

    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.color).toBe(
      `rgb(${SETTINGS_CC_COLORS.Blue})`,
    );
    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.fontSize).toBe(
      `${SETTINGS_CC_TEXT_SIZE['200%']}rem`,
    );
    expect(ui.closeCaptionsContainer.getElementsByClassName()[0].style.backgroundColor).toBe(
      `rgba(${SETTINGS_CC_COLORS.Red},${SETTINGS_CC_OPACITY['25%']})`,
    );
  });

  test('getCloseCaptionStyles', () => {
    const values = {
      textSize: SETTINGS_CC_TEXT_SIZE.Default,
      textColor: SETTINGS_CC_COLORS.Default,
      bgColor: SETTINGS_CC_COLORS.Default,
      bgOpacity: SETTINGS_CC_OPACITY.Default,
    };

    localStorage.setItem(STORAGE_KEYS.CC_STYLES, JSON.stringify({ ...values }));

    const result2 = Utils.getCloseCaptionStyles();
    expect(result2.bgColor).toBe('Default');
    expect(result2.textColor).toBe('Default');
    expect(result2.textSize).toBe('Default');
    expect(result2.bgOpacity).toBe('Default');
  });

  test('isCastSenderFrameworkAvailable - true', () => {
    (window as any).cast = {
      framework: true,
    };
    (window as any).chrome = {
      cast: true,
    };
    expect(Utils.isCastSenderFrameworkAvailable()).toBe(true);
    (window as any).cast = undefined;
    (window as any).chrome = undefined;
  });

  test('isCastSenderFrameworkAvailable - false', () => {
    expect(Utils.isCastSenderFrameworkAvailable()).toBe(undefined);
  });

  test('addEventCallback', () => {
    const UI = vi.fn(() => ({
      player: {
        eventCallbacks: [
          {
            event: 'play',
            callback: callbackMock,
          },
        ],
      },
    }));
    const ui = new UI();

    Utils.addEventCallback(ui as any, EventsEnum.PLAY);
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  test('addEventCallback - undefined if eventsCallback array is empty', () => {
    const UI = vi.fn(() => ({
      player: {
        eventCallbacks: [],
      },
    }));
    const ui = new UI();

    expect(Utils.addEventCallback(ui as any, EventsEnum.PLAY)).toBe(undefined);
  });

  test('addEventCallback - if event not have related event & callback', () => {
    const UI = vi.fn(() => ({
      player: {
        eventCallbacks: [
          {
            event: 'pause',
            callback: callbackMock,
          },
        ],
      },
    }));
    const ui = new UI();

    Utils.addEventCallback(ui as any, EventsEnum.PLAY);
    expect(callbackMock).toHaveBeenCalledTimes(0);
  });

  test('Icons', () => {
    const iconSize = '24px';
    const fill = '#fff';

    expect(Utils.Icons({ type: 'play' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 5v14l11-7L8 5z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'pause' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'volume_up' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'volume_down' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'volume_off' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.34-.3 2.57-.92 3.61-1.75l2.05 2.05 1.41-1.41L4.34 2.93zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-7-8l-1.88 1.88L12 7.76zm4.5 8c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'cast_enter' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M23 3H1v5h2V5h18v14h-7v2h9V3zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'cast_exit' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm22-7H1v5h2V5h18v14h-7v2h9V3z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'airplay_exit' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><path d="M6,22h12l-6-6L6,22z M23,3H1v16h6v-2H3V5h18v12h-4v2h6V3z"/></g></svg>`,
    );

    expect(Utils.Icons({ type: 'airplay_enter' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><path d="M6,22h12l-6-6L6,22z M23,3H1v16h6v-2H3V5h18v12h-4v2h6V3z"/></g></svg>`,
    );

    expect(Utils.Icons({ type: 'fullscreen_enter' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'fullscreen_exit' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'pip_enter' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 11h-8v6h8v-6zm4 10V3H1v18h22zm-2-1.98H3V4.97h18v14.05z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'pip_exit' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M23 3H1v18h22V3zm-2 16h-9v-6h9v6z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'settings' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.44 12.99l-.01.02c.04-.33.08-.67.08-1.01 0-.34-.03-.66-.07-.99l.01.02 2.44-1.92-2.43-4.22-2.87 1.16.01.01c-.52-.4-1.09-.74-1.71-1h.01L14.44 2H9.57l-.44 3.07h.01c-.62.26-1.19.6-1.71 1l.01-.01-2.88-1.17-2.44 4.22 2.44 1.92.01-.02c-.04.33-.07.65-.07.99 0 .34.03.68.08 1.01l-.01-.02-2.1 1.65-.33.26 2.43 4.2 2.88-1.15-.02-.04c.53.41 1.1.75 1.73 1.01h-.03L9.58 22h4.85s.03-.18.06-.42l.38-2.65h-.01c.62-.26 1.2-.6 1.73-1.01l-.02.04 2.88 1.15 2.43-4.2s-.14-.12-.33-.26l-2.11-1.66zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'cc_enabled' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21 4H3v16h18V4zm-10 7H9.5v-.5h-2v3h2V13H11v2H6V9h5v2zm7 0h-1.5v-.5h-2v3h2V13H18v2h-5V9h5v2z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'cc_disabled' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><rect fill="none" height="24" width="24"/><path d="M6.83,4H21v14.17L17.83,15H18v-2h-1.5v0.5h-0.17l-1.83-1.83V10.5h2V11H18V9h-5v1.17L6.83,4z M19.78,22.61L17.17,20H3V5.83 L1.39,4.22l1.41-1.41l18.38,18.38L19.78,22.61z M11,13.83L10.17,13H9.5v0.5h-2v-3h0.17L6.17,9H6v6h5V13.83z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'arrow_back' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M17.51 3.87L15.73 2.1 5.84 12l9.9 9.9 1.77-1.77L9.38 12l8.13-8.13z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'replay' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'rewind' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0z" fill="none"/><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'forward' })).toBe(
      `<svg xmlns="http://www.w3.org/2000/svg" height=${iconSize} viewBox="0 0 24 24" width=${iconSize} fill=${fill}><path d="M0 0h24v24H0z" fill="none"/><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
    );

    expect(Utils.Icons({ type: 'none' })).toBe(``);
  });
});
