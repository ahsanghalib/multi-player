import { AirPlay } from './airplay';
import { Utils } from './utils';

class AirplayTestClass extends AirPlay {
  constructor(ui: any) {
    super(ui);
  }

  webkitPlaybackTargetAvailabilityChangedEventExtended = (
    airplay: HTMLDivElement,
    video: any,
    event: any,
  ) => {
    this.webkitPlaybackTargetAvailabilityChangedEvent(airplay, video)(event);
  };

  webkitCurrentPlaybackTargetIsWirelessChangedEventExtended = (
    airplay: HTMLDivElement,
    isLive: boolean,
    volume: HTMLDivElement,
    event: any,
  ) => {
    this.webkitCurrentPlaybackTargetIsWirelessChangedEvent(airplay, isLive, volume)(event);
  };
}

const isLiveMock = vi.fn();
const getBrowserMock = vi.fn();
const addEventListenerMock = vi.fn();
const airplayDivOnClickMock = vi.fn();
const airplayDivClassListRemoveMock = vi.fn();
const airplayDivClassListAddMock = vi.fn();
const webkitShowPlaybackTargetPickerMock = vi.fn();
const toggleShowHideMock = vi.fn();
const setPlayerStateMock = vi.fn();
const reloadPlayerMock = vi.fn(() => ({ catch: vi.fn() }));

describe('AirPlay', () => {
  test('init - not supported.', () => {
    const airplay = new AirplayTestClass({});

    (window as any).WebKitPlaybackTargetAvailabilityEvent = false;

    const originalGetBrowser = Utils.getBrowser;
    const originalIsLive = Utils.isLive;

    Utils.getBrowser = getBrowserMock.mockReturnValue('chrome');
    Utils.isLive = isLiveMock.mockReturnValue(false);

    airplay.init();

    expect(isLiveMock).not.toHaveBeenCalled();

    Utils.getBrowser = originalGetBrowser;
    Utils.isLive = originalIsLive;
  });

  test('init - supported', () => {
    const airplay = new AirplayTestClass({
      videoElement: {
        addEventListener: addEventListenerMock,
      },
      controlsRemotePlaybackButton: {},
      controlsVolumeWrapper: {},
    });

    (window as any).WebKitPlaybackTargetAvailabilityEvent = true;

    const originalGetBrowser = Utils.getBrowser;
    const originalIsLive = Utils.isLive;

    Utils.getBrowser = getBrowserMock.mockReturnValue('safari');
    Utils.isLive = isLiveMock.mockReturnValue(false);

    airplay.init();

    expect(isLiveMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledTimes(2);

    Utils.getBrowser = originalGetBrowser;
    Utils.isLive = originalIsLive;
  });

  test('webkitPlaybackTargetAvailabilityChangedEvent - available', () => {
    const airplay = new AirplayTestClass({});

    const airplayDiv = {
      innerHTML: '',
      onclick: airplayDivOnClickMock,
      classList: {
        remove: airplayDivClassListRemoveMock,
      },
    };

    const videoMock = {
      webkitShowPlaybackTargetPicker: webkitShowPlaybackTargetPickerMock,
    };

    const eventMock = {
      availability: 'available',
    };

    airplay.webkitPlaybackTargetAvailabilityChangedEventExtended(
      airplayDiv as any,
      videoMock,
      eventMock,
    );

    expect(airplayDivOnClickMock).toHaveBeenCalledTimes(0);
    expect(airplayDivClassListRemoveMock).toHaveBeenCalledTimes(1);
    expect(airplayDivClassListRemoveMock).toHaveBeenCalledWith('none');
    expect(airplayDiv.innerHTML).toEqual(Utils.Icons({ type: 'airplay_enter' }));

    airplayDiv.onclick();
    expect(webkitShowPlaybackTargetPickerMock).toHaveBeenCalledTimes(1);
  });

  test('webkitPlaybackTargetAvailabilityChangedEvent - not available', () => {
    const airplay = new AirplayTestClass({});

    const airplayDiv = {
      innerHTML: Utils.Icons({ type: 'airplay_enter' }),
      classList: {
        add: airplayDivClassListAddMock,
      },
    };

    const videoMock = {};

    const eventMock = {
      availability: 'not-available',
    };

    airplay.webkitPlaybackTargetAvailabilityChangedEventExtended(
      airplayDiv as any,
      videoMock,
      eventMock,
    );

    expect(airplayDivClassListAddMock).toHaveBeenCalledTimes(1);
    expect(airplayDivClassListAddMock).toHaveBeenCalledWith('none');
    expect(airplayDiv.innerHTML).toEqual('');
  });

  test('webkitCurrentPlaybackTargetIsWirelessChangedEvent - connected', () => {
    const airplay = new AirplayTestClass({
      player: {
        setPlayerState: setPlayerStateMock,
        reloadPlayer: reloadPlayerMock,
        playerState: {
          isPlaying: true,
        },
      },
    });

    const airplayDiv = {
      innerHTML: Utils.Icons({ type: 'airplay_enter' }),
    };

    const volumeDiv = {};

    const eventMock = {
      target: {
        remote: {
          state: 'connected',
        },
      },
    };

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    airplay.webkitCurrentPlaybackTargetIsWirelessChangedEventExtended(
      airplayDiv as any,
      true,
      volumeDiv as any,
      eventMock,
    );

    expect(airplayDiv.innerHTML).toEqual(Utils.Icons({ type: 'airplay_exit' }));
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(toggleShowHideMock).toHaveBeenCalledWith(volumeDiv, 'none');
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isAirplay: true });
    expect(reloadPlayerMock).toHaveBeenCalledTimes(1);

    Utils.toggleShowHide = originalToggleShowHide;
  });

  test('webkitCurrentPlaybackTargetIsWirelessChangedEvent - disconnected', () => {
    const airplay = new AirplayTestClass({
      player: {
        setPlayerState: setPlayerStateMock,
        reloadPlayer: reloadPlayerMock,
        playerState: {
          isPlaying: true,
        },
      },
    });

    const airplayDiv = {
      innerHTML: Utils.Icons({ type: 'airplay_exit' }),
    };

    const volumeDiv = {};

    const eventMock = {
      target: {
        remote: {
          state: 'disconnected',
        },
      },
    };

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    airplay.webkitCurrentPlaybackTargetIsWirelessChangedEventExtended(
      airplayDiv as any,
      true,
      volumeDiv as any,
      eventMock,
    );

    expect(airplayDiv.innerHTML).toEqual(Utils.Icons({ type: 'airplay_enter' }));
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(toggleShowHideMock).toHaveBeenCalledWith(volumeDiv, 'flex');
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isAirplay: false });
    expect(reloadPlayerMock).toHaveBeenCalledTimes(1);

    Utils.toggleShowHide = originalToggleShowHide;
  });
});
