import { waitFor } from '@testing-library/dom';
import Shaka from 'shaka-player/dist/shaka-player.compiled.debug';

import { ShakaPlayer } from './shaka';
import { DRMEnums, ISource } from './types';
import { Utils } from './utils';

const isBrowserSupportedMock = vi.fn();
const isLiveMock = vi.fn();
const attachMockResolved = vi.fn(() => Promise.resolve());
const attachMockRejected = vi.fn(() => Promise.reject());
const setPlayerStateMock = vi.fn();
const getBrowserMock = vi.fn();
const resetConfigurationMock = vi.fn();
const ShakaLogsetLevelMock = vi.fn();
const addEventsMock = vi.fn();
const getNetworkingEngineMock = vi.fn();
const hasHeadersMock = vi.fn();
const basicDrmConfigsMock = vi.fn();
const buydrmWidevineRequestFilterMock = vi.fn();
const playerConfigureMock = vi.fn();
const vidgoResponseFilterMock = vi.fn();
const buydrmFairplayRequestFilterMock = vi.fn();
const buyDrmFairplayResponseFilterMock = vi.fn();
const videoPlayMock = vi.fn(() => ({ catch: vi.fn() }));
const playerLoadResolveMock = vi.fn(() => Promise.resolve());
const registerRequestFilterMock = vi.fn();
const registerResponseFilterMock = vi.fn();
const fatelErrorRetryMock = vi.fn();
const removeEventsMock = vi.fn();
const addEventListenerMock = vi.fn();
const removeEventListenerMock = vi.fn();
const toggleWrappersMock = vi.fn();
const getPlayerStateMock = vi.fn();

describe('Shaka Player', () => {
  test('not supported', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(false);

    const shakaPlayer = new ShakaPlayer({} as any);

    expect(shakaPlayer.isSupported).toBe(false);
    expect(isBrowserSupportedMock).toHaveBeenCalledTimes(1);
  });

  test('is supported', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    expect(shakaPlayer.isSupported).toBe(true);
    expect(isBrowserSupportedMock).toHaveBeenCalledTimes(1);
  });

  test('is live', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.isLive = isLiveMock.mockReturnValue(true);

    expect(shakaPlayer.isLive()).toBe(true);
  });

  test('init - not supported', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(false);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.init({} as any, {} as any, false, '', false).catch(() => {});

    expect(shakaPlayer.isSupported).toBe(false);
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test('init - supported', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock.mockReturnValue('chrome');

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock;

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.player.attach = attachMockResolved;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;

    shakaPlayer
      .init({} as any, { url: 'https://source.url' } as ISource, false, '', false)
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockResolved).toHaveBeenCalledTimes(1);
      // expect(addEventsMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'shaka' });
      expect(shakaPlayer.url).toBe('https://source.url');
      expect(resetConfigurationMock).toHaveBeenCalledTimes(1);
      expect(getNetworkingEngineMock).toHaveBeenCalledTimes(2);
      expect(ShakaLogsetLevelMock).toHaveBeenCalledTimes(1);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('init - rejected', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock.mockReturnValue('chrome');

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock;

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.player.attach = attachMockRejected;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;
    shakaPlayer.player.configure = playerConfigureMock;

    shakaPlayer
      .init({} as any, { url: 'https://source.url' } as ISource, false, '', false)
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockRejected).toHaveBeenCalledTimes(1);
      expect(addEventsMock).toHaveBeenCalledTimes(0);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'none' });
      expect(shakaPlayer.url).toBeUndefined();
      expect(resetConfigurationMock).toHaveBeenCalledTimes(0);
      expect(getNetworkingEngineMock).toHaveBeenCalledTimes(0);
      expect(ShakaLogsetLevelMock).toHaveBeenCalledTimes(0);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('init - widevine', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock;

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.player.attach = attachMockResolved;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;
    shakaPlayer.player.configure = playerConfigureMock;
    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.basicDrmConfigs = basicDrmConfigsMock;
    shakaPlayer.buydrmWidevineRequestFilter = buydrmWidevineRequestFilterMock;

    shakaPlayer
      .init(
        {
          play: vi.fn(),
          currentTime: 0,
        } as any,
        {
          url: 'https://source.url',
          drm: {
            drmType: DRMEnums.WIDEVINE,
            licenseUrl: 'license.url',
            certicateUrl: 'certificate.url',
            licenseHeader: { x: 'y' },
          },
        } as ISource,
        false,
        '',
        false,
      )
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockResolved).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'shaka' });
      expect(shakaPlayer.url).toBe('https://source.url');
      expect(basicDrmConfigsMock).toHaveBeenCalledTimes(1);
      expect(buydrmWidevineRequestFilterMock).toHaveBeenCalledTimes(1);
      expect(playerConfigureMock).toHaveBeenCalledTimes(1);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('init - fairplay - isVidgo', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock.mockReturnValue('safari');

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.player.attach = attachMockResolved;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;
    shakaPlayer.player.configure = playerConfigureMock;
    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.basicDrmConfigs = basicDrmConfigsMock;
    shakaPlayer.vidgoResponseFilter = vidgoResponseFilterMock;

    shakaPlayer
      .init(
        {
          play: vi.fn(),
          currentTime: 0,
        } as any,
        {
          url: 'https://source.url',
          drm: {
            drmType: DRMEnums.FAIRPLAY,
            licenseUrl: 'license.url',
            certicateUrl: 'certificate.url',
            licenseHeader: { x: 'y' },
          },
        } as ISource,
        false,
        '',
        true,
      )
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockResolved).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'shaka' });
      expect(shakaPlayer.url).toBe('https://source.url');
      expect(basicDrmConfigsMock).toHaveBeenCalledTimes(1);
      expect(vidgoResponseFilterMock).toHaveBeenCalledTimes(1);
      expect(playerConfigureMock).toHaveBeenCalledTimes(1);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('init - fairplay - hasHeaders', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock.mockReturnValue('safari');

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.player.attach = attachMockResolved;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;
    shakaPlayer.player.configure = playerConfigureMock;
    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.basicDrmConfigs = basicDrmConfigsMock;
    shakaPlayer.buydrmFairplayRequestFilter = buydrmFairplayRequestFilterMock;
    shakaPlayer.buyDrmFairplayResponseFilter = buyDrmFairplayResponseFilterMock;

    shakaPlayer
      .init(
        {
          play: vi.fn(),
          currentTime: 0,
        } as any,
        {
          url: 'https://source.url',
          drm: {
            drmType: DRMEnums.FAIRPLAY,
            licenseUrl: 'license.url',
            certicateUrl: 'certificate.url',
            licenseHeader: { x: 'y' },
          },
        } as ISource,
        false,
        '',
        false,
      )
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockResolved).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'shaka' });
      expect(shakaPlayer.url).toBe('https://source.url');
      expect(basicDrmConfigsMock).toHaveBeenCalledTimes(1);
      expect(buydrmFairplayRequestFilterMock).toHaveBeenCalledTimes(1);
      expect(buyDrmFairplayResponseFilterMock).toHaveBeenCalledTimes(1);
      expect(playerConfigureMock).toHaveBeenCalledTimes(1);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('init - fairplay ', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock.mockReturnValue('safari');

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock.mockReturnValue(false);

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.player.attach = attachMockResolved;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;
    shakaPlayer.player.configure = playerConfigureMock;
    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.basicDrmConfigs = basicDrmConfigsMock;
    shakaPlayer.buydrmFairplayRequestFilter = buydrmFairplayRequestFilterMock;
    shakaPlayer.buyDrmFairplayResponseFilter = buyDrmFairplayResponseFilterMock;

    shakaPlayer
      .init(
        {
          play: vi.fn(),
          currentTime: 0,
        } as any,
        {
          url: 'https://source.url',
          drm: {
            drmType: DRMEnums.FAIRPLAY,
            licenseUrl: 'license.url',
            certicateUrl: 'certificate.url',
          },
        } as ISource,
        false,
        '',
        false,
      )
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockResolved).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'shaka' });
      expect(shakaPlayer.url).toBe('https://source.url');
      expect(basicDrmConfigsMock).toHaveBeenCalledTimes(1);
      expect(buydrmFairplayRequestFilterMock).toHaveBeenCalledTimes(0);
      expect(buyDrmFairplayResponseFilterMock).toHaveBeenCalledTimes(0);
      expect(buydrmWidevineRequestFilterMock).toHaveBeenCalledTimes(0);
      expect(vidgoResponseFilterMock).toHaveBeenCalledTimes(0);
      expect(playerConfigureMock).toHaveBeenCalledTimes(1);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('init - play & curren time ', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);
    (Shaka as any).log.setLevel = ShakaLogsetLevelMock;

    const originalGetBrowser = Utils.getBrowser;
    Utils.getBrowser = getBrowserMock.mockReturnValue('safari');

    const originalHasHeaders = Utils.hasHeader;
    Utils.hasHeader = hasHeadersMock.mockReturnValue(false);

    const shakaPlayer = new ShakaPlayer({
      player: {
        setPlayerState: setPlayerStateMock,
      },
    } as any);

    shakaPlayer.player.attach = attachMockResolved;
    shakaPlayer.player.resetConfiguration = resetConfigurationMock;
    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock;
    shakaPlayer.player.configure = playerConfigureMock;
    shakaPlayer.player.load = playerLoadResolveMock;
    shakaPlayer.addEvents = addEventsMock;
    shakaPlayer.basicDrmConfigs = basicDrmConfigsMock;
    shakaPlayer.buydrmFairplayRequestFilter = buydrmFairplayRequestFilterMock;
    shakaPlayer.buyDrmFairplayResponseFilter = buyDrmFairplayResponseFilterMock;

    const video = {
      play: videoPlayMock,
      currentTime: 0,
    } as any;

    shakaPlayer
      .init(
        video,
        {
          url: 'https://source.url',
          drm: {
            drmType: DRMEnums.FAIRPLAY,
            licenseUrl: 'license.url',
            certicateUrl: 'certificate.url',
          },
          startTime: 10,
        } as ISource,
        false,
        '',
        false,
      )
      .catch(() => {});

    await waitFor(() => {
      expect(attachMockResolved).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledTimes(1);
      expect(setPlayerStateMock).toHaveBeenCalledWith({ player: 'shaka' });
      expect(shakaPlayer.url).toBe('https://source.url');
      expect(basicDrmConfigsMock).toHaveBeenCalledTimes(1);
      expect(buydrmFairplayRequestFilterMock).toHaveBeenCalledTimes(0);
      expect(buyDrmFairplayResponseFilterMock).toHaveBeenCalledTimes(0);
      expect(buydrmWidevineRequestFilterMock).toHaveBeenCalledTimes(0);
      expect(vidgoResponseFilterMock).toHaveBeenCalledTimes(0);
      expect(playerConfigureMock).toHaveBeenCalledTimes(1);
      expect(playerLoadResolveMock).toHaveBeenCalledTimes(1);
      expect(videoPlayMock).toHaveBeenCalledTimes(1);
      expect(video.currentTime).toBe(10);
    });

    Utils.getBrowser = originalGetBrowser;
    Utils.hasHeader = originalHasHeaders;
  });

  test('buydrmWidevineRequestFilter', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock.mockReturnValue({
      registerRequestFilter: registerRequestFilterMock,
      registerResponseFilter: registerResponseFilterMock,
    });

    shakaPlayer.buydrmWidevineRequestFilter({
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.WIDEVINE,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource);

    expect(getNetworkingEngineMock).toHaveBeenCalledTimes(1);
    expect(registerRequestFilterMock).toHaveBeenCalledTimes(1);
    expect(registerResponseFilterMock).toHaveBeenCalledTimes(0);
  });

  test('buydrmFairplayRequestFilter', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock.mockReturnValue({
      registerRequestFilter: registerRequestFilterMock,
      registerResponseFilter: registerResponseFilterMock,
    });

    shakaPlayer.buydrmFairplayRequestFilter({
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.FAIRPLAY,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource);

    expect(getNetworkingEngineMock).toHaveBeenCalledTimes(1);
    expect(registerRequestFilterMock).toHaveBeenCalledTimes(1);
    expect(registerResponseFilterMock).toHaveBeenCalledTimes(0);
  });

  test('buyDrmFairplayResponseFilter', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock.mockReturnValue({
      registerRequestFilter: registerRequestFilterMock,
      registerResponseFilter: registerResponseFilterMock,
    });

    shakaPlayer.buyDrmFairplayResponseFilter();

    expect(getNetworkingEngineMock).toHaveBeenCalledTimes(1);
    expect(registerRequestFilterMock).toHaveBeenCalledTimes(0);
    expect(registerResponseFilterMock).toHaveBeenCalledTimes(1);
  });

  test('vidgoResponseFilter', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.getNetworkingEngine = getNetworkingEngineMock.mockReturnValue({
      registerRequestFilter: registerRequestFilterMock,
      registerResponseFilter: registerResponseFilterMock,
    });

    shakaPlayer.vidgoResponseFilter();

    expect(getNetworkingEngineMock).toHaveBeenCalledTimes(1);
    expect(registerRequestFilterMock).toHaveBeenCalledTimes(0);
    expect(registerResponseFilterMock).toHaveBeenCalledTimes(1);
  });

  test('buydrmWidevineRequestFilterImpl', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const source = {
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.WIDEVINE,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource;

    const filter = shakaPlayer.buydrmWidevineRequestFilterImpl(source);

    const type = Shaka.net.NetworkingEngine.RequestType.LICENSE;
    const req = { headers: {} } as any;

    filter(type, req) as any;

    expect(req.headers).toEqual({
      ...req.headers,
      ...source.drm?.licenseHeader,
    });
  });

  test('buydrmFairplayRequestFilterImpl', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const source = {
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.FAIRPLAY,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource;

    const filter = shakaPlayer.buydrmFairplayRequestFilterImpl(source);

    const type = Shaka.net.NetworkingEngine.RequestType.LICENSE;
    const req = { headers: {}, body: 'body' } as any;

    const originalPayload = new Uint8Array(req.body as any);
    const base64Payload = Shaka.util.Uint8ArrayUtils.toStandardBase64(originalPayload);
    const params = `spc=${base64Payload}&assetId=${null}`;

    filter(type, req) as any;

    expect(req.headers).toEqual({
      ...req.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...source.drm?.licenseHeader,
    });
    expect(req.body).toEqual(Shaka.util.StringUtils.toUTF8(params));
  });

  test('buyDrmFairplayResponseFilterImpl', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const filter = shakaPlayer.buyDrmFairplayResponseFilterImpl();

    const type = Shaka.net.NetworkingEngine.RequestType.LICENSE;

    const body = '<ckc>data</ckc>';
    const bodyBuf = new ArrayBuffer(body.length);
    const bodyBufView = new Uint8Array(bodyBuf);
    for (let i = 0; i < body.length; i++) {
      bodyBufView[i] = body.charCodeAt(i);
    }

    const resp = { data: bodyBuf } as any;

    filter(type, resp) as any;

    expect(resp.data).toEqual(Shaka.util.Uint8ArrayUtils.fromBase64('data').buffer);
  });

  test('vidgoResponseFilterImpl', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const filter = shakaPlayer.vidgoResponseFilterImpl();

    const type = Shaka.net.NetworkingEngine.RequestType.LICENSE;

    const body = JSON.stringify({ ckc: 'data' });
    const bodyBuf = new ArrayBuffer(body.length);
    const bodyBufView = new Uint8Array(bodyBuf);
    for (let i = 0; i < body.length; i++) {
      bodyBufView[i] = body.charCodeAt(i);
    }

    const jsonResp = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(bodyBuf) as any));
    const raw = Buffer.from(jsonResp.ckc, 'base64');
    const rawLength = raw.length;
    const data = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i += 1) {
      data[i] = raw[i];
    }

    const resp = { data: bodyBuf } as any;

    filter(type, resp) as any;

    expect(resp.data).toEqual(data);
  });

  test('basicDrmConfigs - widevine', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const source = {
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.WIDEVINE,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource;

    const configs = shakaPlayer.basicDrmConfigs(source);

    expect(configs).toEqual({
      drm: {
        servers: {
          'com.widevine.alpha': source.drm?.licenseUrl,
        },
        advanced: {
          'com.widevine.alpha': {
            videoRobustness: 'SW_SECURE_CRYPTO',
            audioRobustness: 'SW_SECURE_CRYPTO',
          },
        },
      },
    });
  });

  test('basicDrmConfigs - lagacyFairplay', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const source = {
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.FAIRPLAY,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource;

    const configs = shakaPlayer.basicDrmConfigs(source);

    expect(configs).toEqual({
      drm: {
        servers: {
          'com.apple.fps.1_0': source.drm?.licenseUrl,
        },
        advanced: {
          'com.apple.fps.1_0': {
            serverCertificateUri: source.drm?.certicateUrl,
          },
        },
      },
    });
  });

  test('basicDrmConfigs - fairplay', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const source = {
      url: 'https://source.url',
      drm: {
        drmType: DRMEnums.FAIRPLAY,
        licenseUrl: 'license.url',
        certicateUrl: 'certificate.url',
        licenseHeader: { x: 'y' },
      },
    } as ISource;

    const configs = shakaPlayer.basicDrmConfigs(source, false);

    const initDataTransformMock = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    configs.drm!.initDataTransform = initDataTransformMock;

    expect(configs).toEqual({
      drm: {
        servers: {
          'com.apple.fps': source.drm?.licenseUrl,
        },
        advanced: {
          'com.apple.fps': {
            serverCertificateUri: source.drm?.certicateUrl,
          },
        },
        initDataTransform: initDataTransformMock,
      },
    });
  });

  test('basicDrmConfigs - null', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const source = {
      url: 'https://source.url',
      drm: {},
    } as ISource;

    const configs = shakaPlayer.basicDrmConfigs(source, false);

    expect(configs).toEqual({});
  });

  test('initDataTransformImpl - if not skd', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const initDataTransform = shakaPlayer.initDataTransformImpl(new ArrayBuffer(0), '', {
      serverCertificate: new ArrayBuffer(0),
    });

    expect(initDataTransform).toEqual(new ArrayBuffer(0));
  });

  test('initDataTransformImpl - if skd', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    const contentId = Shaka.util.FairPlayUtils.defaultGetContentId(new ArrayBuffer(10));

    const expected = Shaka.util.FairPlayUtils.initDataTransform(
      new ArrayBuffer(10),
      contentId,
      new ArrayBuffer(10),
    );

    const initDataTransform = shakaPlayer.initDataTransformImpl(new ArrayBuffer(10), 'skd', {
      serverCertificate: new ArrayBuffer(10),
    });

    expect(initDataTransform).toEqual(expected);
  });

  test('reload', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.url = 'https://source.url';
    shakaPlayer.player.load = playerLoadResolveMock;

    shakaPlayer.reload();

    expect(playerLoadResolveMock).toHaveBeenCalledTimes(1);
  });

  test('reload - error', async () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const originalFatelErrorRetry = Utils.fatelErrorRetry;
    Utils.fatelErrorRetry = fatelErrorRetryMock;

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.url = 'https://source.url';
    shakaPlayer.player.load = playerLoadResolveMock.mockRejectedValue(true);

    shakaPlayer.reload().catch(() => {});

    expect(playerLoadResolveMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(fatelErrorRetryMock).toHaveBeenCalledTimes(1);
    });

    Utils.fatelErrorRetry = originalFatelErrorRetry;
  });

  test('destroy', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.detach = vi.fn();

    shakaPlayer.destroy();

    expect(shakaPlayer.player.detach).toHaveBeenCalledTimes(1);
  });

  test('addEvents', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.addEventListener = addEventListenerMock;
    shakaPlayer.removeEvents = removeEventsMock;

    shakaPlayer.addEvents();

    expect(removeEventsMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock).toHaveBeenCalledTimes(3);
  });

  test('removeEvents', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.player.removeEventListener = removeEventListenerMock;

    shakaPlayer.removeEvents();

    expect(removeEventListenerMock).toHaveBeenCalledTimes(3);
  });

  test('shakaBufferingEvent - buffering', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const ui = {
      player: {
        getPlayerState: getPlayerStateMock.mockReturnValue({
          loaded: true,
        }),
      },
    } as any;

    const shakaPlayer = new ShakaPlayer(ui);

    shakaPlayer.shakaBufferingEvent({ buffering: true });

    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledWith({
      ui,
      loading: true,
    });

    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('shakaBufferingEvent - not buffering', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const ui = {
      player: {
        getPlayerState: getPlayerStateMock.mockReturnValue({
          loaded: true,
        }),
      },
    } as any;

    const shakaPlayer = new ShakaPlayer(ui);

    shakaPlayer.shakaBufferingEvent({ buffering: false });

    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledWith({
      ui,
      loading: false,
    });

    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('shakaErrorEvent', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const originalFatelErrorRetry = Utils.fatelErrorRetry;
    Utils.fatelErrorRetry = fatelErrorRetryMock;

    const shakaPlayer = new ShakaPlayer({} as any);

    shakaPlayer.shakaErrorEvent({});

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(fatelErrorRetryMock).toHaveBeenCalledTimes(1);

    Utils.fatelErrorRetry = originalFatelErrorRetry;
  });

  test('shakaStallDetectedEvent', () => {
    Shaka.Player.isBrowserSupported = isBrowserSupportedMock.mockReturnValue(true);

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    const ui = {
      player: {
        getPlayerState: getPlayerStateMock.mockReturnValue({
          loaded: true,
        }),
      },
    } as any;

    const shakaPlayer = new ShakaPlayer(ui);

    shakaPlayer.shakaStallDetectedEvent();

    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledWith({
      ui,
      loading: true,
    });

    Utils.toggleWrappers = originalToggleWrappers;
  });
});
