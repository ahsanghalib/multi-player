import { STORAGE_KEYS } from './types';
import { Utils } from './utils';
import { VideoEvents } from './video.events';

const removeEventsMock = vi.fn();
const removeEventListenerMock = vi.fn();
const addEventsListenerMock = vi.fn();
const playergetConfigMock = vi.fn();
const addEventCallbackMock = vi.fn();
const setPlayerStateMock = vi.fn();
const toggleWrappersMock = vi.fn();
const fatelErrorRetryMock = vi.fn();
const resetRetryCounterMock = vi.fn();
const toggleShowHideMock = vi.fn();
const toggleOpacityMock = vi.fn();
const checkTextTracksMock = vi.fn();
const volumeChangeEventMock = vi.fn();
const onPauseCallbackMock = vi.fn();
const onPlayCallbackMock = vi.fn();
const hlsStopLoadMock = vi.fn();
const hlsStartLoadMock = vi.fn();
const isLiveMock = vi.fn();
const sliderColorValueMock = vi.fn();
const reloadPlayerMock = vi.fn(() => ({ catch: vi.fn() }));
const videoPlayMock = vi.fn(() => ({
  then: vi.fn(() => ({ catch: vi.fn() })),
  catch: vi.fn(),
}));
const videoPlayRejectedMock = vi.fn(() => ({
  then: vi.fn(() => Promise.reject()),
  catch: vi.fn(),
}));

describe('VideoEvents', () => {
  test('addEvents', () => {
    const videoEvents = new VideoEvents({
      videoElement: {
        addEventListener: addEventsListenerMock,
      },
    } as any);

    const originalRemoveEvents = videoEvents.removeEvents;
    videoEvents.removeEvents = removeEventsMock;

    videoEvents.addEvents();

    expect(removeEventsMock).toHaveBeenCalledTimes(1);
    expect(addEventsListenerMock).toHaveBeenCalledTimes(22);

    videoEvents.removeEvents = originalRemoveEvents;
  });

  test('removeEvents', () => {
    const videoEvents = new VideoEvents({
      videoElement: {
        removeEventListener: removeEventListenerMock,
      },
    } as any);

    videoEvents.removeEvents();

    expect(removeEventListenerMock).toHaveBeenCalledTimes(22);
  });

  test('getConfig', () => {
    const videoEvents = new VideoEvents({
      player: {
        getConfig: playergetConfigMock,
      },
    } as any);

    videoEvents.getConfig();

    expect(playergetConfigMock).toHaveBeenCalledTimes(1);
  });

  test('abortEvent', () => {
    const videoEvents = new VideoEvents({
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    } as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.abortEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('canPlayEvent', () => {
    const videoEvents = new VideoEvents({
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    } as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.canPlayEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('canPlayThroughEvent', () => {
    const videoEvents = new VideoEvents({
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    } as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.canPlayThroughEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('durationChangeEvent', () => {
    const videoEvents = new VideoEvents({
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    } as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.durationChangeEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('emptiedEvent', () => {
    const ui = {
      player: {
        playerState: {
          player: 'hls',
        },
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
        getPlayerState: vi.fn().mockReturnValue({
          uiState: 'error',
        }),
      },
    };
    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    videoEvents.emptiedEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isPlaying: false });
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledWith({
      ui,
      loading: true,
    });

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('endedEvent', () => {
    const ui = {
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    videoEvents.endedEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledWith({
      ui,
      ended: true,
    });

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('errorEvent', () => {
    const ui = {
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalFatelErrorRetry = Utils.fatelErrorRetry;
    Utils.fatelErrorRetry = fatelErrorRetryMock;

    videoEvents.errorEvent({});

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(fatelErrorRetryMock).toHaveBeenCalledTimes(1);
    expect(fatelErrorRetryMock).toHaveBeenCalledWith(ui);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.fatelErrorRetry = originalFatelErrorRetry;
  });

  test('loadedDataEvent', () => {
    const controlsWrapper = {
      classList: {
        add: () => {},
        remove: () => {},
      },
    };
    const ui = {
      videoElement: {
        buffered: {
          length: 1,
        },
      },
      controlsWrapper,
      player: {
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
          disableControls: false,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalResetRetryCounter = Utils.resetRetryCounter;
    Utils.resetRetryCounter = resetRetryCounterMock;

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const originalToggleOpacity = Utils.toggleOpacity;
    Utils.toggleOpacity = toggleOpacityMock;

    const originalCheckTextTracks = Utils.checkTextTracks;
    Utils.checkTextTracks = checkTextTracksMock;

    const originalVolumeChangeEvent = videoEvents.volumeChangeEvent;
    videoEvents.volumeChangeEvent = volumeChangeEventMock;

    videoEvents.loadedDataEvent();

    expect(videoEvents.getConfig()?.debug).toBe(true);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(resetRetryCounterMock).toHaveBeenCalledTimes(1);
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(toggleShowHideMock).toHaveBeenCalledWith(controlsWrapper, 'flex');
    expect(toggleOpacityMock).toHaveBeenCalledTimes(1);
    expect(toggleOpacityMock).toHaveBeenCalledWith(controlsWrapper, false);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({
      isPlaying: false,
      loaded: true,
    });
    expect(checkTextTracksMock).toHaveBeenCalledTimes(1);
    expect(checkTextTracksMock).toHaveBeenCalledWith(ui);
    expect(volumeChangeEventMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.resetRetryCounter = originalResetRetryCounter;
    Utils.toggleShowHide = originalToggleShowHide;
    Utils.toggleOpacity = originalToggleOpacity;
    Utils.checkTextTracks = originalCheckTextTracks;
    videoEvents.volumeChangeEvent = originalVolumeChangeEvent;
  });

  test('loadedMetadataEvent', () => {
    const ui = {
      videoElement: {
        play: videoPlayMock,
      },
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
        getPlayerState: vi.fn().mockReturnValue({
          isMuted: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.loadedMetaDataEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(videoPlayMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('loadedMetadataEvent - rejected', () => {
    const ui = {
      videoElement: {
        play: videoPlayRejectedMock,
      },
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
        getPlayerState: vi.fn().mockReturnValue({
          isMuted: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.loadedMetaDataEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(videoPlayRejectedMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('loadStartEvent', () => {
    const ui = {
      player: {
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    videoEvents.loadStartEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isPlaying: false });
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledWith({
      ui,
      loading: true,
    });

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('pauseEvent', () => {
    const ui = {
      controlsPlayPauseButton: {
        innerHTML: '',
      },
      player: {
        setPlayerState: setPlayerStateMock,
        onPauseCallback: onPauseCallbackMock,
        playerState: {
          isPIP: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    videoEvents.pauseEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isPlaying: false });
    expect(onPauseCallbackMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsPlayPauseButton.innerHTML).toBe(Utils.Icons({ type: 'play' }));

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('playEvent', () => {
    const ui = {
      player: {
        onPlayCallback: onPlayCallbackMock,
        playerState: {
          isPIP: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    videoEvents.playEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(onPlayCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('playingEvent', () => {
    const ui = {
      controlsPlayPauseButton: {
        innerHTML: '',
      },
      player: {
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const videoEvents = new VideoEvents(ui as any);

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const originalResetRetryCounter = Utils.resetRetryCounter;
    Utils.resetRetryCounter = resetRetryCounterMock;

    videoEvents.playingEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isPlaying: true });
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsPlayPauseButton.innerHTML).toBe(Utils.Icons({ type: 'pause' }));
    expect(resetRetryCounterMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
    Utils.resetRetryCounter = originalResetRetryCounter;
  });

  test('progressEvent - user paused', () => {
    const ui = {
      player: {
        playerState: {
          hasUserPaused: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.progressEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.progressCounter).toBe(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('progressEvent - time updated', () => {
    const ui = {
      player: {
        playerState: {
          hasUserPaused: false,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.progressCounter = 6;
    videoEvents.timeUpdated = true;

    videoEvents.progressEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.progressCounter).toBe(0);
    expect(videoEvents.timeUpdated).toBe(false);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('progressEvent - user not paused & progress counter is between 6 & 10', () => {
    const ui = {
      videoElement: {
        currentTime: 5,
        buffered: {
          length: 1,
          end: vi.fn(() => 10),
        },
      },
      controlsPlayPauseButton: {
        innerHTML: '',
      },
      player: {
        playerState: {
          hasUserPaused: false,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.progressCounter = 6;

    videoEvents.progressEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.progressCounter).toBe(7);
    expect(videoEvents.timeUpdated).toBe(false);
    expect(ui.videoElement.currentTime).toBe(10);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('progressEvent - user not paused & progress counter is greater then 10', () => {
    const ui = {
      player: {
        reloadPlayer: reloadPlayerMock,
        playerState: {
          hasUserPaused: false,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.progressCounter = 11;

    videoEvents.progressEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(reloadPlayerMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.progressCounter).toBe(1);
    expect(videoEvents.timeUpdated).toBe(false);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('rateChangeEvent', () => {
    const ui = {
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.rateChangeEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('seekedEvent - isPlaying true', () => {
    const ui = {
      player: {
        playerState: {
          isPlaying: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.seekedEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('seekedEvent - isPlaying false', () => {
    const ui = {
      videoElement: {
        play: videoPlayMock,
      },
      player: {
        hls: {
          stopLoad: hlsStopLoadMock,
        },
        playerState: {
          isPlaying: false,
          hasUserPaused: false,
        },

        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.seekedEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(hlsStopLoadMock).toHaveBeenCalledTimes(1);
    expect(videoPlayMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('seekingEvent - isPlaying true', () => {
    const ui = {
      player: {
        hls: {
          stopLoad: hlsStopLoadMock,
          startLoad: hlsStartLoadMock,
        },
        playerState: {
          isPlaying: true,
        },

        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.seekingEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(0);
    expect(hlsStopLoadMock).toHaveBeenCalledTimes(0);
    expect(hlsStartLoadMock).toHaveBeenCalledTimes(0);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('seekingEvent - isPlaying false', () => {
    const ui = {
      player: {
        hls: {
          stopLoad: hlsStopLoadMock,
          startLoad: hlsStartLoadMock,
        },
        playerState: {
          isPlaying: false,
        },

        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.seekingEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(hlsStopLoadMock).toHaveBeenCalledTimes(0);
    expect(hlsStartLoadMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('stalledEvent', () => {
    const ui = {
      videoElement: {
        buffered: {
          length: 1,
          end: vi.fn(() => 100),
        },
        currentTime: 10,
        play: videoPlayMock,
      },
      player: {
        playerState: {
          isPlaying: true,
          hasUserPaused: false,
        },

        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const originalIsLive = Utils.isLive;
    Utils.isLive = isLiveMock.mockReturnValue(true);

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.timeUpdated = false;

    videoEvents.stalledEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(videoPlayMock).toHaveBeenCalledTimes(1);
    expect(ui.videoElement.currentTime).toBe(100);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
    Utils.isLive = originalIsLive;
  });

  test('suspendEvent', () => {
    const ui = {
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.suspendEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
  });

  test('timeUpdateEvent - isLive true', () => {
    const controlsProgressBar = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
    const ui = {
      controlsTimeText: {
        innerText: '',
      },
      videoElement: {
        currentTime: 10,
        duration: 100,
      },
      controlsProgressBar,
      player: {
        playerState: {
          isPlaying: true,
          loaded: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const originalIsLive = Utils.isLive;
    Utils.isLive = isLiveMock.mockReturnValue(true);

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.timeUpdateEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.timeUpdated).toBe(true);
    expect(isLiveMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsTimeText.innerText).toBe('Live');

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
    Utils.isLive = originalIsLive;
    Utils.toggleShowHide = originalToggleShowHide;
  });

  test('timeUpdateEvent - isLive false', () => {
    const ui = {
      controlsProgressRangeInput: {
        value: '',
        max: '',
        min: '',
      },
      controlsProgressBar: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
      controlsTimeText: {
        innerText: '',
      },
      videoElement: {
        currentTime: 10,
        duration: 100,
      },
      player: {
        playerState: {
          isPlaying: true,
          loaded: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const originalIsLive = Utils.isLive;
    Utils.isLive = isLiveMock.mockReturnValue(false);

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const originalSliderColorValue = Utils.sliderColorValue;
    Utils.sliderColorValue = sliderColorValueMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.timeUpdateEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.timeUpdated).toBe(true);
    expect(isLiveMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsTimeText.innerText).toBe('00:10 / 01:40');
    expect(sessionStorage.getItem(STORAGE_KEYS.VIDOE_CURRENT_TIME)).toBe('10');
    expect(sliderColorValueMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsProgressRangeInput.value).toBe('10');
    expect(ui.controlsProgressRangeInput.max).toBe('100');

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
    Utils.isLive = originalIsLive;
    Utils.toggleShowHide = originalToggleShowHide;
    Utils.sliderColorValue = originalSliderColorValue;
  });

  test('timeUpdateEvent - isLive false & duration null & current time null', () => {
    const ui = {
      controlsTimeText: {
        innerText: '',
      },
      videoElement: {
        currentTime: null,
        duration: null,
      },
      player: {
        playerState: {
          isPlaying: true,
          loaded: true,
        },
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const originalIsLive = Utils.isLive;
    Utils.isLive = isLiveMock.mockReturnValue(false);

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.timeUpdateEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(videoEvents.timeUpdated).toBe(true);
    expect(isLiveMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsTimeText.innerText).toBe('');

    Utils.addEventCallback = originalAddEventCallback;
    Utils.isLive = originalIsLive;
    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('volumeChangeEvent - isMuted true', () => {
    const ui = {
      volumeSliderValue: '',
      controlsVolumeRangeInput: {
        value: '',
      },
      controlsVolumeButton: {
        innerHTML: '',
      },
      videoElement: {
        muted: true,
      },
      player: {
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalSliderColorValue = Utils.sliderColorValue;
    Utils.sliderColorValue = sliderColorValueMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.volumeChangeEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(sliderColorValueMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsVolumeRangeInput.value).toBe('0');
    expect(ui.volumeSliderValue).toBe('0');
    expect(ui.controlsVolumeButton.innerHTML).toBe(Utils.Icons({ type: 'volume_off' }));
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isMuted: true });

    Utils.addEventCallback = originalAddEventCallback;
    Utils.sliderColorValue = originalSliderColorValue;
  });

  test('volumeChangeEvent - isMuted false volume > 0.5', () => {
    const ui = {
      volumeSliderValue: '',
      controlsVolumeRangeInput: {
        value: '',
      },
      controlsVolumeButton: {
        innerHTML: '',
      },
      videoElement: {
        muted: false,
        volume: 0.6,
      },
      player: {
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalSliderColorValue = Utils.sliderColorValue;
    Utils.sliderColorValue = sliderColorValueMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.volumeChangeEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(sliderColorValueMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsVolumeRangeInput.value).toBe('0.6');
    expect(ui.volumeSliderValue).toBe('0.6');
    expect(ui.controlsVolumeButton.innerHTML).toBe(Utils.Icons({ type: 'volume_up' }));
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isMuted: false });

    Utils.addEventCallback = originalAddEventCallback;
    Utils.sliderColorValue = originalSliderColorValue;
  });

  test('volumeChangeEvent - isMuted false volume <= 0.5', () => {
    const ui = {
      volumeSliderValue: '',
      controlsVolumeRangeInput: {
        value: '',
      },
      controlsVolumeButton: {
        innerHTML: '',
      },
      videoElement: {
        muted: false,
        volume: 0.5,
      },
      player: {
        setPlayerState: setPlayerStateMock,
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalSliderColorValue = Utils.sliderColorValue;
    Utils.sliderColorValue = sliderColorValueMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.volumeChangeEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(sliderColorValueMock).toHaveBeenCalledTimes(1);
    expect(ui.controlsVolumeRangeInput.value).toBe('0.5');
    expect(ui.volumeSliderValue).toBe('0.5');
    expect(ui.controlsVolumeButton.innerHTML).toBe(Utils.Icons({ type: 'volume_down' }));
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isMuted: false });

    Utils.addEventCallback = originalAddEventCallback;
    Utils.sliderColorValue = originalSliderColorValue;
  });

  test('waitingEvent', () => {
    const ui = {
      player: {
        getConfig: vi.fn().mockReturnValue({
          debug: true,
        }),
        hls: {
          startLoad: hlsStartLoadMock,
        },
        playerState: {
          hasUserPaused: false,
        },
      },
    };

    const originalAddEventCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const videoEvents = new VideoEvents(ui as any);

    videoEvents.waitingEvent();

    expect(videoEvents.getConfig()).toEqual({ debug: true });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(hlsStartLoadMock).toHaveBeenCalledTimes(1);

    Utils.addEventCallback = originalAddEventCallback;
    Utils.toggleWrappers = originalToggleWrappers;
  });
});
