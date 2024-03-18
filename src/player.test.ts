import { waitFor } from "@testing-library/dom";
import { Player } from "./player";
import { DRMEnums, IConfig, IPlayerState, ISource, PlayersEnum } from "./types";
import { Utils } from "./utils";

const nativePlayerInit = vi.fn();
const shakaPlayerInit = vi.fn();
const hlsPlyaerInit = vi.fn();
const onPlayerStateChangeMock = vi.fn();
const fullScreenEventMock = vi.fn();
const enterPIPMock = vi.fn();
const leavePIPMock = vi.fn();
const toggleShowHideMock = vi.fn();
const toggleOpacityMock = vi.fn();
const resetRetryCounterMock = vi.fn();
const shakaPlayerDestroy = vi.fn();
const hlsPlayerDestroy = vi.fn();
const nativePlayerDestroy = vi.fn();
const toggleTextTracksMock = vi.fn();
const videoRemoveEventsMock = vi.fn();
const removeUIMock = vi.fn();
const removeAllUIMock = vi.fn();
const stopCastingMock = vi.fn();
const delayMock = vi.fn();
const shakaReload = vi.fn();
const retryMock = vi.fn();
const toggleWrappersMock = vi.fn();
const reloadPlayerMock = vi.fn(() => ({ catch: vi.fn() }));
const setSourceMock = vi.fn(() => ({ catch: vi.fn() }));

describe("Player Class", () => {
  beforeEach(() => {
    Player._instance = undefined;
  });

  test("getInstance - okay", () => {
    vi.spyOn(Player, "_isBrowser").mockReturnValue(true);
    const player = Player.getInstance();
    expect(Player._isBrowser).toHaveBeenCalled();
    expect(player).toBeInstanceOf(Player);
    expect((window as any).muxjs).not.toBeUndefined();
  });

  test("getInstance - failed", () => {
    vi.spyOn(Player, "_isBrowser").mockReturnValue(false);
    expect(() => Player.getInstance()).toThrowError();
  });

  test("init - if no root element then return", async () => {
    const player = Player.getInstance();

    vi.spyOn(player, "updateConfig");
    vi.spyOn(player, "setSource");
    vi.spyOn(player.castSender, "init");
    vi.spyOn(player.ui, "setContainer");
    vi.spyOn(player.videoEvents, "addEvents");
    vi.spyOn(player.airplay, "init");
    vi.spyOn(player, "__windowOnLoad");
    vi.spyOn(Utils, "setCloseCaptionStyles");

    const args = {
      elem: undefined as any,
      source: {},
    };

    player.init({ ...args }).catch(() => {});

    await waitFor(() => {
      expect(player.eventCallbacks).toEqual([]);
      expect(player.onPauseCallback).toBeUndefined();
      expect(player.onPlayCallback).toBeUndefined();
      expect(player.onEnterPIPCallback).toBeUndefined();
      expect(player.onLeavePIPCallback).toBeUndefined();
      expect(player.onPlayerStateChange).toBeUndefined();
      expect(player.updateConfig).not.toBeCalled();
      expect(player.castSender.init).not.toBeCalled();
      expect(player.setSource).not.toBeCalled();
      expect(player.ui.setContainer).not.toBeCalled();
      expect(player.videoEvents.addEvents).not.toBeCalled();
      expect(player.airplay.init).not.toBeCalled();
      expect(player.__windowOnLoad).not.toBeCalled();
      expect(Utils.setCloseCaptionStyles).not.toBeCalled();
      expect(player.isInitialized).toBe(false);
    });
  });

  test("init - success", async () => {
    const player = Player.getInstance();

    vi.spyOn(player, "updateConfig");
    vi.spyOn(player, "setSource");
    vi.spyOn(player.castSender, "init");
    vi.spyOn(player.ui, "setContainer");
    vi.spyOn(player.videoEvents, "addEvents");
    vi.spyOn(player.airplay, "init");
    vi.spyOn(player, "__windowOnLoad");
    vi.spyOn(Utils, "setCloseCaptionStyles");

    const args = {
      elem: document.createElement("div"),
      source: { url: "https://source.url" } as ISource,
      config: {} as Partial<IConfig>,
      contextLogoUrl: "https://context.logo.url",
      onPauseCallback: () => {},
      onPlayCallback: () => {},
      onEnterPIPCallback: () => {},
      onLeavePIPCallback: () => {},
      onPlayerStateChange: (_: IPlayerState) => {},
      eventCallbacks: [{ event: "play" as any, callback: () => {} }],
    };

    player.init({ ...args }).catch(() => {});

    await waitFor(() => {
      expect(player.eventCallbacks).toEqual(args.eventCallbacks);
      expect(player.onPauseCallback).toEqual(args.onPauseCallback);
      expect(player.onPlayCallback).toEqual(args.onPlayCallback);
      expect(player.onEnterPIPCallback).toEqual(args.onEnterPIPCallback);
      expect(player.onLeavePIPCallback).toEqual(args.onLeavePIPCallback);
      expect(player.onPlayerStateChange).toEqual(args.onPlayerStateChange);
      expect(player.updateConfig).toHaveBeenCalledTimes(1);
      expect(player.updateConfig).toHaveBeenCalledWith(args.config);
      expect(player.castSender.init).toHaveBeenCalledTimes(1);
      expect(player.setSource).toHaveBeenCalledTimes(1);
      expect(player.setSource).toHaveBeenCalledWith(args.source, false);
      expect(player.ui.setContainer).toHaveBeenCalledTimes(1);
      expect(player.videoEvents.addEvents).toHaveBeenCalledTimes(1);
      expect(player.airplay.init).toHaveBeenCalledTimes(1);
      expect(player.__windowOnLoad).toHaveBeenCalledTimes(1);
      expect(Utils.setCloseCaptionStyles).toHaveBeenCalledTimes(1);
      expect(player.isInitialized).toBe(true);
    });
  });

  test("setSource - if source url null return", () => {
    const player = Player.getInstance();
    const source = {} as ISource;

    vi.spyOn(Promise, "resolve");

    player.setSource(source, false).catch(() => {});

    expect(Promise.resolve).toHaveBeenCalledTimes(1);
  });

  test("setSource - native player", async () => {
    const player = Player.getInstance();
    const source = {
      url: "https://source.mp4",
      startTime: -1,
    } as ISource;

    player.native.init = nativePlayerInit;

    player.setSource(source, false).catch(() => {});

    await waitFor(() => {
      expect(nativePlayerInit).toHaveBeenCalledTimes(1);
      expect(player.source).toEqual(source);
    });
  });

  test("setSource - if casitng return", async () => {
    const player = Player.getInstance();
    const source = {
      url: "https://source.mp4",
      startTime: -1,
    } as ISource;

    const promiseResolve = vi.spyOn(Promise, "resolve");

    player.setPlayerState({ isCasting: true });

    player.setSource(source, false).catch(() => {});

    await waitFor(() => {
      expect(promiseResolve).toHaveBeenCalledTimes(1);
      expect(player.source).toEqual(source);
    });
  });

  test("setSource - shaka player", async () => {
    const player = Player.getInstance();
    const source = {
      url: "https://source.mpd",
      drm: {
        drmType: DRMEnums.WIDEVINE,
        licenseUrl: "https://license.url",
      },
      startTime: -1,
    } as ISource;

    player.shaka.init = shakaPlayerInit;

    player.setSource(source, false).catch(() => {});

    await waitFor(() => {
      expect(shakaPlayerInit).toHaveBeenCalledTimes(1);
      expect(player.source).toEqual(source);
    });
  });

  test("setSource - shaka player", async () => {
    const player = Player.getInstance();
    const source = {
      url: "https://source.m3u8",
      startTime: -1,
    } as ISource;

    player.hls.init = hlsPlyaerInit;

    const resolved = vi.fn();
    const rejected = vi.fn();

    player.setSource(source, false).then(resolved).catch(rejected);

    await waitFor(() => {
      expect(hlsPlyaerInit).toHaveBeenCalledTimes(1);
      expect(player.source).toEqual(source);
      expect(resolved).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });
  });

  test("setSource - no player", async () => {
    const player = Player.getInstance();
    const source = {
      url: "https://source.abc",
      startTime: -1,
    } as ISource;

    const resolved = vi.fn();
    const rejected = vi.fn();

    player.native.init = nativePlayerInit.mockRejectedValue(true);

    player.setSource(source, false).then(resolved).catch(rejected);

    await waitFor(() => {
      expect(player.source).toEqual(source);
    });
  });

  test("getSource", () => {
    const player = Player.getInstance();
    const source = {
      url: "https://source.m3u8",
    };

    player.source = source;

    expect(player.getSource()).toEqual(source);
  });

  test("getConfig", () => {
    const player = Player.getInstance();
    const config = {
      debug: true,
      isVidgo: true,
    } as any;

    player.config = config;

    expect(player.getConfig()).toEqual(config);
  });

  test("updateConfig", () => {
    const player = Player.getInstance();

    player.updateConfig({ debug: true, isVidgo: false });

    expect(player.config).toEqual({
      ...player.config,
      debug: true,
      isVidgo: false,
    });
  });

  test("getPlayerState", () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      isCasting: true,
    };

    expect(player.getPlayerState()).toEqual(player.playerState);
  });

  test("setPlayerState", () => {
    const player = Player.getInstance();
    player.onPlayerStateChange = onPlayerStateChangeMock;
    player.setPlayerState({ isCasting: true });
    expect(player.playerState).toEqual({
      ...player.playerState,
      isCasting: true,
    });
    expect(onPlayerStateChangeMock).toHaveBeenCalledTimes(1);
  });

  test("fullScreenEvent", () => {
    const player = Player.getInstance();

    const original = Utils.fullScreenEvent;
    Utils.fullScreenEvent = fullScreenEventMock;

    player.fullScreenEvent({} as any);

    expect(fullScreenEventMock).toHaveBeenCalledTimes(1);
    Utils.fullScreenEvent = original;
  });

  test("enterPIPEvent", () => {
    const player = Player.getInstance();

    const original = Utils.enterPIP;
    Utils.enterPIP = enterPIPMock;

    player.enterPIPEvent({} as any);

    expect(enterPIPMock).toHaveBeenCalledTimes(1);
    Utils.enterPIP = original;
  });

  test("leavePIPEvent", () => {
    const player = Player.getInstance();

    const origianl = Utils.leavePIP;
    Utils.leavePIP = leavePIPMock;

    player.leavePIPEvent({} as any);

    expect(leavePIPMock).toHaveBeenCalledTimes(1);
    Utils.leavePIP = origianl;
  });

  test("getVideoElement", () => {
    const player = Player.getInstance();

    const ui = {
      videoElement: document.createElement("video"),
    } as any;

    player.ui = ui as any;

    player.getVideoElement();

    expect(player.getVideoElement()).toEqual(ui.videoElement);
  });

  test("detachMediaElement - player none", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.NONE,
    };

    const resovled = vi.fn();
    const rejected = vi.fn();

    player.detachMediaElement(false).then(resovled).catch(rejected);

    await waitFor(() => {
      expect(resovled).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });
  });

  test("detachMediaElement - retry false - shaka player", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.SHAKA,
    };

    player.ui = {
      controlsTimeText: { innerText: "" },
      controlsPIP: { innerHTML: "", classList: { add: vi.fn() } },
      controlsCloseCaptionButton: { classList: { add: vi.fn() } },
      optionsMenuState: "",
      optionsMenuWrapper: {
        innerHTML: "",
      },
    } as any;

    player.shaka.destroy = shakaPlayerDestroy;

    const origialToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const origianToggleOpacity = Utils.toggleOpacity;
    Utils.toggleOpacity = toggleOpacityMock;

    const originalResetRetryCounter = Utils.resetRetryCounter;
    Utils.resetRetryCounter = resetRetryCounterMock;

    const originalToggleTextTracks = Utils.toggleTextTracks;
    Utils.toggleTextTracks = toggleTextTracksMock;

    const resovled = vi.fn();
    const rejected = vi.fn();

    player.detachMediaElement(false).then(resovled).catch(rejected);

    await waitFor(() => {
      expect(toggleShowHideMock).toHaveBeenCalledTimes(3);
      expect(toggleOpacityMock).toHaveBeenCalledTimes(1);
      expect(resetRetryCounterMock).toHaveBeenCalledTimes(1);
      expect(shakaPlayerDestroy).toHaveBeenCalledTimes(1);
      expect(toggleTextTracksMock).toHaveBeenCalledTimes(1);
      expect(player.playerState.player).toBe(PlayersEnum.NONE);
      expect(resovled).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });

    Utils.toggleShowHide = origialToggleShowHide;
    Utils.toggleOpacity = origianToggleOpacity;
    Utils.resetRetryCounter = originalResetRetryCounter;
    Utils.toggleTextTracks = originalToggleTextTracks;
  });

  test("detachMediaElement - retry true hls player", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.HLS,
    };

    player.hls.destroy = hlsPlayerDestroy;

    const originalToggleTextTracks = Utils.toggleTextTracks;
    Utils.toggleTextTracks = toggleTextTracksMock;

    const resovled = vi.fn();
    const rejected = vi.fn();

    player.detachMediaElement(true).then(resovled).catch(rejected);

    await waitFor(() => {
      expect(hlsPlayerDestroy).toHaveBeenCalledTimes(1);
      expect(toggleTextTracksMock).toHaveBeenCalledTimes(1);
      expect(player.playerState.player).toBe(PlayersEnum.NONE);
      expect(resovled).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });

    Utils.toggleTextTracks = originalToggleTextTracks;
  });

  test("detachMediaElement - retry true native player", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.NATIVE,
    };

    player.native.destroy = nativePlayerDestroy;

    const originalToggleTextTracks = Utils.toggleTextTracks;
    Utils.toggleTextTracks = toggleTextTracksMock;

    const resovled = vi.fn();
    const rejected = vi.fn();

    player.detachMediaElement(true).then(resovled).catch(rejected);

    await waitFor(() => {
      expect(nativePlayerDestroy).toHaveBeenCalledTimes(1);
      expect(toggleTextTracksMock).toHaveBeenCalledTimes(1);
      expect(player.playerState.player).toBe(PlayersEnum.NONE);
      expect(resovled).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });

    Utils.toggleTextTracks = originalToggleTextTracks;
  });

  test("detachMediaElement - rejected", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.NATIVE,
    };

    player.native.destroy = nativePlayerDestroy.mockRejectedValue(true);

    const resovled = vi.fn();
    const rejected = vi.fn();

    player.detachMediaElement(true).then(resovled).catch(rejected);

    await waitFor(() => {
      expect(nativePlayerDestroy).toHaveBeenCalledTimes(1);
      expect(player.playerState.player).toBe(PlayersEnum.NATIVE);
      expect(resovled).toHaveBeenCalledTimes(0);
      expect(rejected).toHaveBeenCalledTimes(1);
    });
  });

  test("removePlayer", () => {
    const player = Player.getInstance();
    player.removePlayer();
    expect(player.isInitialized).toBe(false);
  });

  test("removePlayer - isIntialized", async () => {
    const player = Player.getInstance();

    player.isInitialized = true;

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.NATIVE,
    };

    player.ui = {
      videoElement: document.createElement("video"),
      removeUI: removeUIMock,
      controlsTimeText: { innerText: "" },
      controlsPIP: { innerHTML: "", classList: { add: vi.fn() } },
      controlsCloseCaptionButton: { classList: { add: vi.fn() } },
      optionsMenuState: "",
      optionsMenuWrapper: {
        innerHTML: "",
      },
    } as any;

    player.native.destroy = nativePlayerDestroy;

    const origialToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const origianToggleOpacity = Utils.toggleOpacity;
    Utils.toggleOpacity = toggleOpacityMock;

    const originalResetRetryCounter = Utils.resetRetryCounter;
    Utils.resetRetryCounter = resetRetryCounterMock;

    const originalToggleTextTracks = Utils.toggleTextTracks;
    Utils.toggleTextTracks = toggleTextTracksMock;

    player.videoEvents.removeEvents = videoRemoveEventsMock;

    player.removePlayer();

    await waitFor(() => {
      expect(player.ui.videoElement.muted).toBe(true);
      expect(videoRemoveEventsMock).toHaveBeenCalledTimes(1);
      expect(removeUIMock).toHaveBeenCalledTimes(1);
      expect(player.isInitialized).toBe(false);
    });

    Utils.toggleShowHide = origialToggleShowHide;
    Utils.toggleOpacity = origianToggleOpacity;
    Utils.resetRetryCounter = originalResetRetryCounter;
    Utils.toggleTextTracks = originalToggleTextTracks;
  });

  test("unmount - isCasting", () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      isCasting: true,
    };

    player.castSender.stopCasting = stopCastingMock;

    player.ui.removeAllUI = removeAllUIMock;

    player.unmount();

    expect(stopCastingMock).toHaveBeenCalledTimes(1);
    expect(removeAllUIMock).toHaveBeenCalledTimes(0);
    expect(player.playerState).toEqual(player.playerState);
    expect(player.isInitialized).toBe(false);
  });

  test("unmount", () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      isCasting: false,
    };

    player.isInitialized = true;

    player.ui.removeAllUI = removeAllUIMock;
    player.removePlayer = vi.fn();

    player.unmount();

    expect(removeAllUIMock).toHaveBeenCalledTimes(1);
    expect(player.isInitialized).toBe(true);
  });

  test("reloadPlayer - resolved if player shaka", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.SHAKA,
    };

    const original = Utils.delay;
    Utils.delay = delayMock;

    player.shaka.reload = shakaReload;
    player.retry = retryMock;

    const resolved = vi.fn();
    const rejected = vi.fn();

    player.reloadPlayer().then(resolved).catch(rejected);

    await waitFor(() => {
      expect(delayMock).toHaveBeenCalledTimes(1);
      expect(shakaReload).toHaveBeenCalledTimes(1);
      expect(retryMock).toHaveBeenCalledTimes(0);
      expect(resolved).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });

    Utils.delay = original;
  });

  test("reloadPlayer - resolved if player not shaka", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.NATIVE,
    };

    const original = Utils.delay;
    Utils.delay = delayMock;

    player.shaka.reload = shakaReload;
    player.retry = retryMock;

    const resolved = vi.fn();
    const rejected = vi.fn();

    player.reloadPlayer(false).then(resolved).catch(rejected);

    await waitFor(() => {
      expect(delayMock).toHaveBeenCalledTimes(0);
      expect(shakaReload).toHaveBeenCalledTimes(0);
      expect(retryMock).toHaveBeenCalledTimes(1);
      expect(resolved).toHaveBeenCalledTimes(1);
      expect(rejected).toHaveBeenCalledTimes(0);
    });

    Utils.delay = original;
  });

  test("reloadPlayer - rejected shaka", async () => {
    const player = Player.getInstance();

    player.playerState = {
      ...player.playerState,
      player: PlayersEnum.NATIVE,
    };

    const original = Utils.delay;
    Utils.delay = delayMock.mockRejectedValue(true);

    player.shaka.reload = shakaReload;
    player.retry = retryMock;

    const resolved = vi.fn();
    const rejected = vi.fn();

    player.reloadPlayer().then(resolved).catch(rejected);

    await waitFor(() => {
      expect(delayMock).toHaveBeenCalledTimes(1);
      expect(shakaReload).toHaveBeenCalledTimes(0);
      expect(retryMock).toHaveBeenCalledTimes(0);
      expect(resolved).toHaveBeenCalledTimes(0);
      expect(rejected).toHaveBeenCalledTimes(1);
    });

    Utils.delay = original;
  });

  test("retry", () => {
    const player = Player.getInstance();

    const original = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    player.reloadPlayer = reloadPlayerMock as any;

    player.retry();

    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(reloadPlayerMock).toHaveBeenCalledTimes(1);

    Utils.toggleWrappers = original;
  });

  test("retry - hard true", () => {
    const player = Player.getInstance();

    const original = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    player.reloadPlayer = reloadPlayerMock as any;
    player.setSource = setSourceMock as any;

    player.retry(true);

    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(setSourceMock).toHaveBeenCalledTimes(1);
    expect(reloadPlayerMock).toHaveBeenCalledTimes(0);

    Utils.toggleWrappers = original;
  });

  test("onTogglePlayPause", () => {
    const player = Player.getInstance();

    const mock = vi.fn(() => ({ catch: vi.fn() }));
    const original = Utils.togglePlayPause;
    Utils.togglePlayPause = mock as any;

    player.onTogglePlayPause();

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.togglePlayPause = original;
  });

  test("onToggleMuteUnMute", () => {
    const player = Player.getInstance();

    const mock = vi.fn();
    const original = Utils.toggleMuteUnMute;
    Utils.toggleMuteUnMute = mock;

    player.onToggleMuteUnMute();

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.toggleMuteUnMute = original;
  });

  test("onToggleForwardRewind", () => {
    const player = Player.getInstance();

    const mock = vi.fn();
    const original = Utils.toggleForwardRewind;
    Utils.toggleForwardRewind = mock;

    player.onToggleForwardRewind(false);

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.toggleForwardRewind = original;
  });

  test("onSeekTime", () => {
    const player = Player.getInstance();

    const mock = vi.fn();
    const original = Utils.seekTime;
    Utils.seekTime = mock;

    player.onSeekTime(10);

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.seekTime = original;
  });

  test("onTogglePip", () => {
    const player = Player.getInstance();

    const mock = vi.fn();
    const original = Utils.togglePip;
    Utils.togglePip = mock;

    player.onTogglePip();

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.togglePip = original;
  });

  test("onToggleFullScreen", () => {
    const player = Player.getInstance();

    const mock = vi.fn();
    const original = Utils.toggleFullScreen;
    Utils.toggleFullScreen = mock;

    player.onToggleFullScreen();

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.toggleFullScreen = original;
  });

  test("onEndedReplay", () => {
    const player = Player.getInstance();

    const mock = vi.fn();
    const original = Utils.onEndedReplay;
    Utils.onEndedReplay = mock;

    player.onEndedReplay();

    expect(mock).toHaveBeenCalledTimes(1);

    Utils.onEndedReplay = original;
  });
});
