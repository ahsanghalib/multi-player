import Hls from 'hls.js/dist/hls.min';

import { HlsPlayer } from './hls';
import { ISource } from './types';
import { Utils } from './utils';

const addEventsMock = vi.fn();
const isSupportedMock = vi.fn();
const attachMediaMock = vi.fn();
const playerStartLoadMock = vi.fn();
const plyaerStopLoadMock = vi.fn();
const playerDetachMediaMock = vi.fn();
const playerDestroyMock = vi.fn();
const playerONMock = vi.fn();
const playerRemoveAllListenersMock = vi.fn();
const toggleWrappersMock = vi.fn();
const fatelErrorRetryMock = vi.fn();

describe('hls player', () => {
  test('init - not supported', () => {
    const hlsPlayer = new HlsPlayer({} as any);

    const originalAddEvents = hlsPlayer.addEvents;
    hlsPlayer.addEvents = addEventsMock;

    const originalHlsIsSupported = Hls.isSupported;
    Hls.isSupported = isSupportedMock.mockImplementation(() => false);

    hlsPlayer.init({} as any, {} as any, false).catch(() => {});

    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('HLS not supported.');
    expect(addEventsMock).not.toHaveBeenCalled();
    expect(hlsPlayer.player).toBeNull();

    hlsPlayer.addEvents = originalAddEvents;
    Hls.isSupported = originalHlsIsSupported;
  });

  test('init - supported', () => {
    const hlsPlayer = new HlsPlayer({} as any);

    const originalAddEvents = hlsPlayer.addEvents;
    hlsPlayer.addEvents = addEventsMock;

    const originalHlsIsSupported = Hls.isSupported;
    Hls.isSupported = isSupportedMock.mockImplementation(() => true);

    hlsPlayer.init({} as any, { url: 'https://source.url' } as ISource, false).catch(() => {});

    expect(console.error).not.toHaveBeenCalled();
    expect(hlsPlayer.player).not.toBeNull();
    expect(addEventsMock).toHaveBeenCalled();

    hlsPlayer.addEvents = originalAddEvents;
    Hls.isSupported = originalHlsIsSupported;
  });

  test('init - supported', async () => {
    const hlsPlayer = new HlsPlayer({} as any);

    const originalHlsIsSupported = Hls.isSupported;
    Hls.isSupported = isSupportedMock.mockImplementation(() => true);

    hlsPlayer.player = new Hls({} as any);

    hlsPlayer.player.attachMedia = attachMediaMock;

    hlsPlayer.init({} as any, { url: 'https://source.url' } as ISource, false).catch(() => {});

    expect(console.error).not.toHaveBeenCalled();
    expect(hlsPlayer.player).not.toBeNull();
    expect(attachMediaMock).toHaveBeenCalledTimes(1);

    Hls.isSupported = originalHlsIsSupported;
    hlsPlayer.player = null;
  });

  test('destroy', async () => {
    const hlsPlayer = new HlsPlayer({} as any);
    hlsPlayer.player = new Hls({} as any);

    hlsPlayer.player.stopLoad = plyaerStopLoadMock;
    hlsPlayer.player.detachMedia = playerDetachMediaMock;
    hlsPlayer.player.destroy = playerDestroyMock;

    hlsPlayer.destroy().catch(() => {});

    expect(plyaerStopLoadMock).toHaveBeenCalledTimes(1);
    expect(playerDetachMediaMock).toHaveBeenCalledTimes(1);
    expect(playerDestroyMock).toHaveBeenCalledTimes(1);
    expect(hlsPlayer.player).toBeNull();

    hlsPlayer.player = null;
  });

  test('startLoad', () => {
    const hlsPlayer = new HlsPlayer({} as any);
    hlsPlayer.isHlsStopped = true;
    hlsPlayer.player = new Hls({} as any);

    hlsPlayer.player.startLoad = playerStartLoadMock;

    hlsPlayer.startLoad();

    expect(playerStartLoadMock).toHaveBeenCalledTimes(1);
    expect(hlsPlayer.isHlsStopped).toBeFalsy();

    hlsPlayer.isHlsStopped = true;
    hlsPlayer.startLoad(200);

    expect(playerStartLoadMock).toHaveBeenCalledTimes(2);
    expect(playerStartLoadMock).toHaveBeenCalledWith(200);
    expect(hlsPlayer.isHlsStopped).toBeFalsy();
  });

  test('stopLoad', () => {
    const hlsPlayer = new HlsPlayer({} as any);
    hlsPlayer.isHlsStopped = false;
    hlsPlayer.player = new Hls({} as any);

    hlsPlayer.player.stopLoad = plyaerStopLoadMock;

    hlsPlayer.stopLoad();

    expect(plyaerStopLoadMock).toHaveBeenCalledTimes(1);
    expect(hlsPlayer.isHlsStopped).toBeTruthy();
  });

  test('addEvents', () => {
    const hlsPlayer = new HlsPlayer({} as any);
    hlsPlayer.player = new Hls({} as any);

    hlsPlayer.player.on = playerONMock;

    hlsPlayer.addEvents();

    expect(playerONMock).toHaveBeenCalledTimes(1);
    expect(playerONMock).toHaveBeenCalledWith(Hls.Events.ERROR, expect.any(Function));
  });

  test('removeEvents', () => {
    const hlsPlayer = new HlsPlayer({} as any);
    hlsPlayer.player = new Hls({} as any);

    hlsPlayer.player.removeAllListeners = playerRemoveAllListenersMock;

    hlsPlayer.removeEvents();

    expect(playerRemoveAllListenersMock).toHaveBeenCalledTimes(1);
  });

  test('errorEvent - not fatal', () => {
    const hlsPlayer = new HlsPlayer({} as any);

    Utils.toggleWrappers = toggleWrappersMock;

    hlsPlayer.errorEvent({} as any, { details: 'bufferStalledError' });

    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
  });

  test('errorEvent - fatal', () => {
    const hlsPlayer = new HlsPlayer({} as any);

    Utils.fatelErrorRetry = fatelErrorRetryMock;

    hlsPlayer.errorEvent({} as any, { fatal: true });

    expect(fatelErrorRetryMock).toHaveBeenCalledTimes(1);
  });
});
