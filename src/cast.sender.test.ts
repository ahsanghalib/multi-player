import { waitFor } from '@testing-library/dom';

import { CastingSender } from './cast.sender';
import { STORAGE_KEYS } from './types';
import { Utils } from './utils';

const SessionRequestMock = vi.fn();
const ApiConfigMock = vi.fn();
const initializeMock = vi.fn();
const sessionAddUpdateListener = vi.fn();
const sessionAddMessageListenerMock = vi.fn();
const onConnectionStatusChangedMock = vi.fn();
const removeUpdateListenerMock = vi.fn();
const removeMessageListenerMock = vi.fn();
const classListRemoveMock = vi.fn();
const classListAddMock = vi.fn();
const castingButtonOnClickMock = vi.fn();
const setPlayerStateMock = vi.fn();
const removePlayerMock = vi.fn();
const addCastingUIElementsMock = vi.fn();
const CastingUIBindsMock = vi.fn();
const removeCastingUIElementsMock = vi.fn();
const playerInitMock = vi.fn(() => ({ catch: vi.fn() }));
const stopCastingMock = vi.fn();
const sessionStopMock = vi.fn();
const requestSessionMock = vi.fn();
const addEventCallbackMock = vi.fn();
const sendMessageMock = vi.fn();
const onPlayCallbackMock = vi.fn();
const onPauseCallbackMock = vi.fn();

describe('CastingSender', () => {
  test('init - if not valid browser', () => {
    const sender = new CastingSender({
      player: {
        config: {
          castReceiverId: 'id',
        },
      },
    } as any);

    Utils.getBrowser = vi.fn().mockReturnValue('safari');

    sender.init();

    expect(sender.castReceiverId).toBe(null);
    expect(sender.apiReady).toBe(false);
    expect(SessionRequestMock).toHaveBeenCalledTimes(0);
    expect(ApiConfigMock).toHaveBeenCalledTimes(0);
    expect(initializeMock).toHaveBeenCalledTimes(0);
  });

  test('init - if valid browser chrome', () => {
    const sender = new CastingSender({
      player: {
        config: {
          castReceiverId: 'id',
        },
      },
    } as any);

    Utils.getBrowser = vi.fn().mockReturnValue('chrome');

    sender.loaded = true;

    (window as any).chrome = {
      cast: {
        SessionRequest: SessionRequestMock,
        ApiConfig: ApiConfigMock,
        initialize: initializeMock,
      },
    };

    sender.init();

    expect(sender.castReceiverId).toBe('id');
    expect(sender.apiReady).toBe(true);
    expect(SessionRequestMock).toHaveBeenCalledTimes(1);
    expect(ApiConfigMock).toHaveBeenCalledTimes(1);
    expect(initializeMock).toHaveBeenCalledTimes(1);
  });

  test('init - if valid browser edge', () => {
    const sender = new CastingSender({
      player: {
        config: {
          castReceiverId: 'id',
        },
      },
    } as any);

    Utils.getBrowser = vi.fn().mockReturnValue('edge');

    sender.loaded = true;

    (window as any).chrome = {
      cast: {
        SessionRequest: SessionRequestMock,
        ApiConfig: ApiConfigMock,
        initialize: initializeMock,
      },
    };

    sender.init();

    expect(sender.castReceiverId).toBe('id');
    expect(sender.apiReady).toBe(true);
    expect(SessionRequestMock).toHaveBeenCalledTimes(1);
    expect(ApiConfigMock).toHaveBeenCalledTimes(1);
    expect(initializeMock).toHaveBeenCalledTimes(1);
  });

  test('onInitSuccess', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const sender = new CastingSender({} as any);
    sender.onInitSuccess();
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('onInitError', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const sender = new CastingSender({} as any);
    sender.onInitError('error');
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(sender.hasReceivers).toBe(false);
    expect(sender.isCasting).toBe(false);
  });

  test('onSessionInitiated', () => {
    const sender = new CastingSender({} as any);

    sender.onConnectionStatusChanged = onConnectionStatusChangedMock;

    sender.onSessionInitiated({
      addUpdateListener: sessionAddUpdateListener,
      addMessageListener: sessionAddMessageListenerMock,
    });

    expect(sessionAddMessageListenerMock).toHaveBeenCalledTimes(1);
    expect(sessionAddUpdateListener).toHaveBeenCalledTimes(1);
    expect(onConnectionStatusChangedMock).toHaveBeenCalledTimes(1);
  });

  test('removeListeners', () => {
    const sender = new CastingSender({} as any);

    sender.session = {
      removeUpdateListener: removeUpdateListenerMock,
      removeMessageListener: removeMessageListenerMock,
    };

    sender.removeListeners();

    expect(removeUpdateListenerMock).toHaveBeenCalledTimes(1);
    expect(removeMessageListenerMock).toHaveBeenCalledTimes(1);
  });

  test('onReceiverStatusChange - hasReceivers true', () => {
    const sender = new CastingSender({
      player: {
        isInitialized: true,
      },
    } as any);

    sender.playerCastingButton = {
      innerHTML: '',
      classList: {
        remove: classListRemoveMock,
      },
      onclick: castingButtonOnClickMock,
    } as any;

    sender.onReceiverStatusChange('available');

    expect(sender.hasReceivers).toBe(true);
    expect(sender.isCasting).toBe(false);
    expect(sender.playerCastingButton.innerHTML).toEqual(
      Utils.Icons({
        type: 'cast_enter',
      }),
    );
    expect(classListRemoveMock).toHaveBeenCalledTimes(1);
  });

  test('onReceiverStatusChange - hasReceivers false', () => {
    const sender = new CastingSender({
      player: {
        isInitialized: true,
      },
    } as any);

    sender.playerCastingButton = {
      innerHTML: Utils.Icons({
        type: 'cast_enter',
      }),
      classList: {
        add: classListAddMock,
      },
      onclick: castingButtonOnClickMock,
    } as any;

    sender.onReceiverStatusChange('not-available');

    expect(sender.hasReceivers).toBe(false);
    expect(sender.isCasting).toBe(false);
    expect(sender.playerCastingButton.innerHTML).toEqual('');
    expect(classListAddMock).toHaveBeenCalledTimes(1);
  });

  test('onConnectionStatusChanged - connected', async () => {
    const sender = new CastingSender({
      addCastingUIElements: addCastingUIElementsMock,
      player: {
        isInitialized: true,
        removePlayer: removePlayerMock,
        setPlayerState: setPlayerStateMock,
      },
      mainWrapper: {
        classList: {
          add: classListAddMock,
        },
      },
      getVideoElement: () => ({
        currentTime: 100,
      }),
    } as any);

    sender.session = {
      status: 'connected',
      receiver: {
        friendlyName: 'receiver',
      },
    };

    sender.playerCastingButton = {
      innerHTML: '',
    } as any;

    const originalCastingUIBinds = sender.CastingUIBinds;
    sender.CastingUIBinds = CastingUIBindsMock;

    sender.onConnectionStatusChanged();

    expect(sender.isCasting).toBe(true);
    expect(sender.seekTime).toBe(100);
    expect(sender.receiverName).toBe('receiver');

    expect(sender.playerCastingButton.innerHTML).toEqual(
      Utils.Icons({
        type: 'cast_exit',
      }),
    );
    expect(classListAddMock).toHaveBeenCalledTimes(1);
    expect(removePlayerMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ isCasting: true });
      expect(addCastingUIElementsMock).toHaveBeenCalledTimes(1);
      expect(CastingUIBindsMock).toHaveBeenCalledTimes(1);
    });

    sender.CastingUIBinds = originalCastingUIBinds;
  });

  test('onConnectionStatusChanged - not connected', async () => {
    const sender = new CastingSender({
      addCastingUIElements: addCastingUIElementsMock,
      removeCastingUIElements: removeCastingUIElementsMock,
      player: {
        isInitialized: false,
        removePlayer: removePlayerMock,
        setPlayerState: setPlayerStateMock,
        init: playerInitMock,
      },
      mainWrapper: {
        classList: {
          add: classListAddMock,
        },
      },
      getVideoElement: () => ({
        currentTime: 100,
      }),
    } as any);

    sender.isCasting = true;

    sender.session = {
      status: 'not_connected',
      receiver: {
        friendlyName: 'receiver',
      },
    };

    sender.playerCastingButton = {
      innerHTML: '',
    } as any;

    sender.onConnectionStatusChanged();

    expect(sender.isCasting).toBe(false);
    expect(sender.seekTime).toBe(-1);
    expect(sender.receiverName).toBe('');

    expect(sender.playerCastingButton.innerHTML).toEqual('');
    expect(classListAddMock).toHaveBeenCalledTimes(0);
    expect(removePlayerMock).toHaveBeenCalledTimes(0);

    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(setPlayerStateMock).toHaveBeenCalledWith({ isCasting: false });
    expect(removeCastingUIElementsMock).toHaveBeenCalledTimes(1);
  });

  test('CastingUIBinds', () => {
    const sender = new CastingSender({
      castingTitle: {
        innerHTML: '',
      },
      castingRemotePlaybackButton: {
        onclick: vi.fn(),
      },
      castingPlayPauseButton: {
        onclick: vi.fn(),
      },
      castingVolumeButtoon: {
        onclick: vi.fn(),
      },
      castingForwardButton: {
        onclick: vi.fn(),
      },
      castingRewindButton: {
        onclick: vi.fn(),
      },
      castingRestartPlayButton: {
        onclick: vi.fn(),
      },
      castingCloseCaptionButton: {
        onclick: vi.fn(),
      },
    } as any);

    sender.CastingUIBinds();
  });

  test('onConnectionError', () => {
    const sender = new CastingSender({} as any);

    const originalStopCasting = sender.stopCasting;
    sender.stopCasting = stopCastingMock;

    sender.onConnectionError({ code: 'timeout' });

    expect(stopCastingMock).toHaveBeenCalledTimes(1);

    sender.stopCasting = originalStopCasting;
  });

  test('stopCasting', () => {
    const sender = new CastingSender({} as any);
    sender.session = {
      stop: sessionStopMock,
    };
    sender.stopCasting();
    expect(sessionStopMock).toHaveBeenCalledTimes(1);
  });

  test('stopCasting - error', () => {
    const sender = new CastingSender({} as any);
    sender.stopCasting();
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('cast - api not ready', () => {
    const sender = new CastingSender({} as any);
    sender.cast();
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('cast - not have receivers', () => {
    const sender = new CastingSender({} as any);
    sender.apiReady = true;
    sender.cast();
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('cast - when apiReady & hasReceivers', () => {
    const sender = new CastingSender({} as any);
    sender.apiReady = true;
    sender.hasReceivers = true;

    (window as any).chrome = {
      cast: {
        requestSession: requestSessionMock,
      },
    };

    sender.cast();

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(requestSessionMock).toHaveBeenCalledTimes(1);
  });

  test('onMessageReceived - error', () => {
    const sender = new CastingSender({} as any);
    sender.onMessageReceived(null, null);
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('onMessageReceived - info', () => {
    const sender = new CastingSender({} as any);
    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'info',
        data: { currentTime: 100.1234 },
      }),
    );
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(sessionStorage.getItem(STORAGE_KEYS.VIDOE_CURRENT_TIME)).toBe('100');
  });

  test('onMessageReceived - player_loaded', () => {
    const sender = new CastingSender({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      castingCloseCaptionButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
    } as any);
    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player_loaded',
        data: { texts: ['text'], variants: [] },
      }),
    );
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(2);
    expect(classListRemoveMock).toHaveBeenCalledTimes(1);
  });

  test('onMessageReceived - player - playing true', () => {
    const sender = new CastingSender({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      castingPlayPauseButton: {
        innerHTMl: '',
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'playing', value: true },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(sender.ui.castingPlayPauseButton.innerHTML).toEqual(Utils.Icons({ type: 'pause' }));
  });

  test('onMessageReceived - player - playing false', () => {
    const sender = new CastingSender({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      castingPlayPauseButton: {
        innerHTMl: '',
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'playing', value: false },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(sender.ui.castingPlayPauseButton.innerHTML).toEqual(Utils.Icons({ type: 'play' }));
  });

  test('onMessageReceived - player - mute true', () => {
    const sender = new CastingSender({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      castingVolumeButtoon: {
        innerHTMl: '',
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'mute', value: true },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(sender.ui.castingVolumeButtoon.innerHTML).toEqual(Utils.Icons({ type: 'volume_off' }));
  });

  test('onMessageReceived - player - mute false', () => {
    const sender = new CastingSender({
      player: {
        setPlayerState: setPlayerStateMock,
      },
      castingVolumeButtoon: {
        innerHTMl: '',
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'mute', value: false },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
    expect(sender.ui.castingVolumeButtoon.innerHTML).toEqual(Utils.Icons({ type: 'volume_up' }));
  });

  test('onMessageReceived - player - text-tracks true', () => {
    const sender = new CastingSender({
      castingCloseCaptionButton: {
        innerHTMl: '',
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'text-tracks', value: true },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(sender.ui.castingCloseCaptionButton.innerHTML).toEqual(
      Utils.Icons({ type: 'cc_enabled' }),
    );
    expect(sender.isTextTrackVisible).toBe(true);
  });

  test('onMessageReceived - player - text-tracks false', () => {
    const sender = new CastingSender({
      castingCloseCaptionButton: {
        innerHTMl: '',
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'text-tracks', value: false },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(sender.ui.castingCloseCaptionButton.innerHTML).toEqual(
      Utils.Icons({ type: 'cc_disabled' }),
    );
    expect(sender.isTextTrackVisible).toBe(false);
  });

  test('onMessageReceived - player - abort', () => {
    const sender = new CastingSender({
      castingPlayPauseButton: {
        classList: {
          add: classListAddMock,
        },
      },
      castingVolumeButtoon: {
        classList: {
          add: classListAddMock,
        },
      },
      castingForwardButton: {
        classList: {
          add: classListAddMock,
        },
      },
      castingRestartPlayButton: {
        classList: {
          add: classListAddMock,
        },
      },
      castingRewindButton: {
        classList: {
          add: classListAddMock,
        },
      },
      castingCloseCaptionButton: {
        classList: {
          add: classListAddMock,
        },
      },
    } as any);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'abort' },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(classListAddMock).toHaveBeenCalledTimes(6);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'emptied' },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(classListAddMock).toHaveBeenCalledTimes(12);

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'ended' },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(classListAddMock).toHaveBeenCalledTimes(18);
  });

  test('onMessageReceived - player - canplaythrough type !== channel', () => {
    const sender = new CastingSender({
      castingPlayPauseButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingVolumeButtoon: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingForwardButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingRestartPlayButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingRewindButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
    } as any);

    const originalAddEventsCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'canplaythrough' },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(classListRemoveMock).toHaveBeenCalledTimes(5);

    Utils.addEventCallback = originalAddEventsCallback;
  });

  test('onMessageReceived - player - canplaythrough type === channel', () => {
    const sender = new CastingSender({
      castingPlayPauseButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingVolumeButtoon: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingForwardButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingRestartPlayButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
      castingRewindButton: {
        classList: {
          remove: classListRemoveMock,
        },
      },
    } as any);

    const originalAddEventsCallback = Utils.addEventCallback;
    Utils.addEventCallback = addEventCallbackMock;

    sender.type = 'channel';

    sender.onMessageReceived(
      null,
      JSON.stringify({
        type: 'player',
        data: { event: 'canplaythrough' },
      }),
    );

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(addEventCallbackMock).toHaveBeenCalledTimes(1);
    expect(classListRemoveMock).toHaveBeenCalledTimes(2);

    Utils.addEventCallback = originalAddEventsCallback;
  });

  test('sendMessage', () => {
    const sender = new CastingSender({} as any);
    sender.isCasting = true;
    sender.session = {
      sendMessage: sendMessageMock,
    };

    sender.sendMessage({ type: 'player', data: { event: 'play' } });

    expect(console.log).toHaveBeenCalledTimes(0);
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
  });

  test('onPlayPause - isPlaying true', () => {
    const sender = new CastingSender({
      player: {
        playerState: {
          isPlaying: true,
        },
        onPlayCallback: onPlayCallbackMock,
        onPauseCallback: onPauseCallbackMock,
      },
    } as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onPlayPause();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(onPauseCallbackMock).toHaveBeenCalledTimes(1);
    expect(onPlayCallbackMock).toHaveBeenCalledTimes(0);

    sender.sendMessage = originalSendMessage;
  });

  test('onPlayPause - isPlaying false', () => {
    const sender = new CastingSender({
      player: {
        playerState: {
          isPlaying: false,
        },
        onPlayCallback: onPlayCallbackMock,
        onPauseCallback: onPauseCallbackMock,
      },
    } as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onPlayPause();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(onPauseCallbackMock).toHaveBeenCalledTimes(0);
    expect(onPlayCallbackMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('onMuteUnMute', () => {
    const sender = new CastingSender({
      player: {
        playerState: {
          isMuted: true,
        },
      },
    } as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onMuteUnMute();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('onForward', () => {
    const sender = new CastingSender({} as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onForward();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('onRewind', () => {
    const sender = new CastingSender({} as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onRewind();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('onRestartPlay', () => {
    const sender = new CastingSender({} as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onRestartPlay();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('onTextTracksChange', () => {
    const sender = new CastingSender({} as any);

    sender.isTextTrackVisible = true;

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.onTextTracksChange();

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('sendSourceInfo', () => {
    const sender = new CastingSender({} as any);

    sender.type = undefined;

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.sendSourceInfo({
      type: null,
      stream: null,
      vidgoToken: null,
      seekTime: null,
    });

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('sendMediaInfo', () => {
    const sender = new CastingSender({} as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.sendMediaInfo({
      vidTitle: null,
      description: null,
      logoUrl: null,
    });

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });

  test('sendRefreshToken', () => {
    const sender = new CastingSender({} as any);

    const originalSendMessage = sender.sendMessage;
    sender.sendMessage = sendMessageMock;

    sender.sendRefreshToken('token');

    expect(sendMessageMock).toHaveBeenCalledTimes(1);

    sender.sendMessage = originalSendMessage;
  });
});
