import { fireEvent, getByRole, queryByRole } from '@testing-library/dom';

import {
  SETTINGS_CC_COLORS,
  SETTINGS_CC_OPACITY,
  SETTINGS_CC_TEXT_SIZE,
  SETTINGS_SUB_MENU,
} from './types';
import { UI } from './ui';
import { Utils } from './utils';

const toggleWrappersMock = vi.fn();
const addContainerWrapperMock = vi.fn();
const addElementsMock = vi.fn();
const addMainWrapperMock = vi.fn();
const addAspectRatioMock = vi.fn();
const addWrapperDivMock = vi.fn();
const addMediaDivMock = vi.fn();
const addVideoElementMock = vi.fn();
const addCloseCaptionContainerMock = vi.fn();
const addLoaderWrapperMock = vi.fn();
const addEndedWrapperMock = vi.fn();
const addControlsWrapperMock = vi.fn();
const addControlsProgressBarMock = vi.fn();
const addOptionsMenuWrapperMock = vi.fn();
const addContextMenuMock = vi.fn();
const addErrorWrapperMock = vi.fn();
const addContentNotAvailableWrapperMock = vi.fn();
const toggleOpacityMock = vi.fn();
const hideContextMenuMock = vi.fn();
const addControlsPlayPauseButtonMock = vi.fn();
const addVolumeControlsMock = vi.fn();
const addControlsTimeTextMock = vi.fn();
const addControlsRemovePlaybackMock = vi.fn();
const addControlsPIPMock = vi.fn();
const addControlsCloseCaptionButtonMock = vi.fn();
const addControlsFullScreenMock = vi.fn();
const addControlsSettingsButtonMock = vi.fn();
const onEndedReplayMock = vi.fn();
const togglePlayPauseMock = vi.fn();
const onVolumeSliderChange = vi.fn();
const onVideoProgressChange = vi.fn();
const addControlsCloseCaptionMenuMock = vi.fn();
const toggleShowHideMock = vi.fn();
const setSelectedTextTrackMock = vi.fn();
const addControlsSetingsMenuMock = vi.fn();
const getCloseCaptionStylesMock = vi.fn();
const isFullScreenMock = vi.fn();
const toggleMuteUnMuteMock = vi.fn();
const setCloseCaptionStylesMock = vi.fn();
const toggleFullScreenMock = vi.fn();

describe('UI Class', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('contructor', () => {
    const ui = new UI();
    expect(ui).toBeInstanceOf(UI);
  });

  test('setContainer', () => {
    const ui = new UI();

    const originalToggleWrappers = Utils.toggleWrappers;
    Utils.toggleWrappers = toggleWrappersMock;

    ui.addContainerWrapper = addContainerWrapperMock;
    ui.addElements = addElementsMock;

    const player = {} as any;
    const elem = document.createElement('div');

    ui.setContainer(player, elem);

    expect(ui.player).toBe(player);
    expect(ui.container).toBe(elem);
    expect(ui.container.style.backgroundColor).toBe('#000');
    expect(ui.contextLogoUrl).toBe('');
    expect(addContainerWrapperMock).toHaveBeenCalledTimes(1);
    expect(addElementsMock).toHaveBeenCalledTimes(1);
    expect(toggleWrappersMock).toHaveBeenCalledTimes(1);

    Utils.toggleWrappers = originalToggleWrappers;
  });

  test('addElements', () => {
    const ui = new UI();

    ui.addMainWrapper = addMainWrapperMock;
    ui.addAspectRatio = addAspectRatioMock;
    ui.addWrapperDiv = addWrapperDivMock;
    ui.addMediaDiv = addMediaDivMock;
    ui.addVideoElement = addVideoElementMock;
    ui.addCloseCaptionContainer = addCloseCaptionContainerMock;
    ui.addLoaderWrapper = addLoaderWrapperMock;
    ui.addEndedWrapper = addEndedWrapperMock;
    ui.addControlsWrapper = addControlsWrapperMock;
    ui.addControlsProgressBar = addControlsProgressBarMock;
    ui.addOptionsMenuWrapper = addOptionsMenuWrapperMock;
    ui.addContextMenu = addContextMenuMock;
    ui.addErrorWrapper = addErrorWrapperMock;
    ui.addContentNotAvailableWrapper = addContentNotAvailableWrapperMock;

    ui.addElements();

    expect(addMainWrapperMock).toHaveBeenCalledTimes(1);
    expect(addAspectRatioMock).toHaveBeenCalledTimes(1);
    expect(addWrapperDivMock).toHaveBeenCalledTimes(1);
    expect(addMediaDivMock).toHaveBeenCalledTimes(1);
    expect(addVideoElementMock).toHaveBeenCalledTimes(1);
    expect(addCloseCaptionContainerMock).toHaveBeenCalledTimes(1);
    expect(addLoaderWrapperMock).toHaveBeenCalledTimes(1);
    expect(addEndedWrapperMock).toHaveBeenCalledTimes(1);
    expect(addControlsWrapperMock).toHaveBeenCalledTimes(1);
    expect(addControlsProgressBarMock).toHaveBeenCalledTimes(1);
    expect(addOptionsMenuWrapperMock).toHaveBeenCalledTimes(1);
    expect(addContextMenuMock).toHaveBeenCalledTimes(1);
    expect(addErrorWrapperMock).toHaveBeenCalledTimes(1);
    expect(addContentNotAvailableWrapperMock).toHaveBeenCalledTimes(1);
    expect(ui.isElementsAdded).toBe(true);
  });

  test('removeUI - isElementsAdded false', () => {
    const ui = new UI();

    ui.mainWrapper = {
      remove: vi.fn(),
    } as any;

    ui.isElementsAdded = false;

    ui.removeUI();

    expect(ui.isElementsAdded).toBe(false);
    expect(ui.mainWrapper.remove).toHaveBeenCalledTimes(0);
  });

  test('removeUI - isElementsAdded true', () => {
    const ui = new UI();

    ui.mainWrapper = {
      remove: vi.fn(),
    } as any;

    ui.isElementsAdded = true;

    ui.removeUI();

    expect(ui.isElementsAdded).toBe(false);
    expect(ui.mainWrapper.remove).toHaveBeenCalledTimes(1);
  });

  test('removeCastingUIElements - isCastingUIAdded false', () => {
    const ui = new UI();

    ui.castingWrapper = {
      remove: vi.fn(),
    } as any;

    ui.isElementsAdded = false;
    ui.isCastingUIAdded = false;

    ui.removeCastingUIElements();

    expect(ui.isElementsAdded).toBe(false);
    expect(ui.isCastingUIAdded).toBe(false);
    expect(ui.castingWrapper.remove).toHaveBeenCalledTimes(0);
  });

  test('removeCastingUIElements - isCastingUIAdded true', () => {
    const ui = new UI();

    ui.castingWrapper = {
      remove: vi.fn(),
    } as any;

    ui.isElementsAdded = true;
    ui.isCastingUIAdded = true;

    ui.removeCastingUIElements();

    expect(ui.isElementsAdded).toBe(false);
    expect(ui.isCastingUIAdded).toBe(false);
    expect(ui.castingWrapper.remove).toHaveBeenCalledTimes(1);
  });

  test('removeAllUI - isElementsAdded false', () => {
    const ui = new UI();

    ui.containerWrapper = {
      remove: vi.fn(),
    } as any;

    ui.isElementsAdded = false;
    ui.isCastingUIAdded = false;

    ui.removeAllUI();

    expect(ui.isElementsAdded).toBe(false);
    expect(ui.isCastingUIAdded).toBe(false);
    expect(ui.containerWrapper.remove).toHaveBeenCalledTimes(0);
  });

  test('removeAllUI - isElementsAdded true', () => {
    const ui = new UI();

    ui.containerWrapper = {
      remove: vi.fn(),
    } as any;

    ui.isElementsAdded = true;
    ui.isCastingUIAdded = true;

    ui.removeAllUI();

    expect(ui.isElementsAdded).toBe(false);
    expect(ui.isCastingUIAdded).toBe(false);
    expect(ui.containerWrapper.remove).toHaveBeenCalledTimes(1);
  });

  test('create', () => {
    const ui = new UI();

    const elem1 = ui.create({
      tag: 'div',
      parent: document.body,
      className: 'test',
      id: 'test-id',
      innerHTML: '<div>innerHTML</div>',
    });

    expect(elem1).toBeInstanceOf(HTMLDivElement);
    expect(elem1.className).toBe('test');
    expect(elem1.id).toBe('test-id');
    expect(elem1.innerHTML).toBe('<div>innerHTML</div>');

    const elem2 = ui.create({
      tag: 'div',
      parent: document.body,
      classListAdd: ['test', 'test_2'],
      id: 'test-id',
      innerText: 'innerText',
    });

    expect(elem2).toBeInstanceOf(HTMLDivElement);
    expect(elem2.className).toBe('test test_2');
    expect(elem2.id).toBe('test-id');
    expect(elem2.innerText).toBe('innerText');
  });

  test('addContainerWrapper', () => {
    const ui = new UI();

    ui.container = document.createElement('div');

    ui.addContainerWrapper();

    expect(ui.containerWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.containerWrapper.className).toBe('wrapper');
    expect(ui.containerWrapper.id).toBe('media-player-main-wrappper');
    expect(ui.containerWrapper.parentElement).toBe(ui.container);
  });

  test('addMainWrapper', () => {
    const ui = new UI();

    ui.containerWrapper = document.createElement('div');

    ui.addMainWrapper();

    expect(ui.mainWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.mainWrapper.className).toBe('media-player');
    expect(ui.mainWrapper.parentElement).toBe(ui.containerWrapper);
  });

  test('addMediaDiv', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addMediaDiv();

    expect(ui.media).toBeInstanceOf(HTMLDivElement);
    expect(ui.media.className).toBe('media');
    expect(ui.media.parentElement).toBe(ui.wrapper);
  });

  test('addWrapperDiv', () => {
    const ui = new UI();

    ui.mainWrapper = document.createElement('div');

    ui.addWrapperDiv();

    expect(ui.wrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.wrapper.className).toBe('wrapper');
    expect(ui.wrapper.parentElement).toBe(ui.mainWrapper);
  });

  test('addAspectRatio', () => {
    const ui = new UI();

    ui.mainWrapper = document.createElement('div');

    ui.addAspectRatio();

    expect(ui.mainWrapper.children[0].className).toBe('aspect reset');
    expect(ui.mainWrapper.children[0].parentElement).toBe(ui.mainWrapper);
  });

  test('mainWrapperMouseEnter', () => {
    const ui = new UI();

    ui.player = {
      getPlayerState: vi.fn().mockReturnValue({
        loaded: true,
        uiState: 'loading',
      }),
    } as any;

    const originalToggleOpacity = Utils.toggleOpacity;
    Utils.toggleOpacity = toggleOpacityMock;

    ui.mainWrapperMouseEnter();

    expect(toggleOpacityMock).toHaveBeenCalledTimes(1);

    Utils.toggleOpacity = originalToggleOpacity;
  });

  test('mainWrapperMouseLeave - if in display return', () => {
    const ui = new UI();

    ui.optionsMenuWrapper = document.createElement('div');
    ui.optionsMenuWrapper.classList.add('flex');

    const originalToggleOpacity = Utils.toggleOpacity;
    Utils.toggleOpacity = toggleOpacityMock;

    ui.mainWrapperMouseLeave();

    vi.runAllTimers();

    expect(toggleOpacityMock).toHaveBeenCalledTimes(0);

    Utils.toggleOpacity = originalToggleOpacity;
  });

  test('mainWrapperMouseLeave', () => {
    const ui = new UI();

    ui.optionsMenuWrapper = document.createElement('div');
    ui.optionsMenuWrapper.classList.add('none');

    const originalToggleOpacity = Utils.toggleOpacity;
    Utils.toggleOpacity = toggleOpacityMock;

    ui.mainWrapperMouseLeave();

    vi.runAllTimers();

    expect(toggleOpacityMock).toHaveBeenCalledTimes(1);

    Utils.toggleOpacity = originalToggleOpacity;
  });

  test('mainWrapperContextMenu', () => {
    const ui = new UI();

    ui.mainWrapper = document.createElement('div');
    ui.contextMenu = document.createElement('div');
    ui.hideContextMenu = hideContextMenuMock;

    ui.mainWrapperContextMenu({
      preventDefault: vi.fn(),
      clientX: '10',
      clientY: '20',
    } as any);

    expect(ui.contextMenu.style.display).toBe('block');
    expect(ui.contextMenu.style.left).toBe('-5px');
    expect(ui.contextMenu.style.top).toBe('-5px');

    expect(hideContextMenuMock).toHaveBeenCalledTimes(1);
  });

  test('hideContextMenu - timer false', () => {
    const ui = new UI();

    ui.contextMenu = document.createElement('div');
    ui.contextMenu.style.display = 'block';

    ui.hideContextMenu(false);

    expect(ui.contextMenu.style.display).toBe('none');
  });

  test('hideContextMenu - timer true', () => {
    const ui = new UI();

    ui.contextMenu = document.createElement('div');
    ui.contextMenu.style.display = 'block';

    ui.hideContextMenu(true);

    vi.runAllTimers();

    expect(ui.contextMenu.style.display).toBe('none');
  });

  test('mainWrapperClick', () => {
    const ui = new UI();

    ui.hideContextMenu = hideContextMenuMock;

    ui.mainWrapperClick({ preventDefault: vi.fn() } as any);

    expect(hideContextMenuMock).toHaveBeenCalledTimes(1);
  });

  test('addCloseCaptionContainer', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addCloseCaptionContainer();

    expect(ui.closeCaptionsContainer).toBeInstanceOf(HTMLDivElement);
    expect(ui.closeCaptionsContainer.className).toBe('close-captions-container');
    expect(ui.closeCaptionsContainer.parentElement).toBe(ui.wrapper);
  });

  test('addLoaderWrapper', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addLoaderWrapper();

    expect(ui.loaderWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.loaderWrapper.className).toBe('loader-wrapper');
    expect(ui.loaderWrapper.parentElement).toBe(ui.wrapper);
  });

  test('addEndedWrapper', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    const orginalOnEndedReplay = Utils.onEndedReplay;
    Utils.onEndedReplay = onEndedReplayMock;

    ui.addEndedWrapper();

    expect(ui.endedWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.endedWrapper.className).toBe('ended-wrapper');
    expect(ui.endedWrapper.parentElement).toBe(ui.wrapper);
    expect(ui.replayButton).toBeInstanceOf(HTMLDivElement);
    expect(ui.replayButton.className).toBe('icons');
    expect(ui.replayButton.parentElement).toBe(ui.endedWrapper);

    fireEvent.click(ui.endedWrapper);

    expect(onEndedReplayMock).toHaveBeenCalledTimes(1);

    Utils.onEndedReplay = orginalOnEndedReplay;
  });

  test('addControlsWrapper', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addControlsPlayPauseButton = addControlsPlayPauseButtonMock;
    ui.addVolumeControls = addVolumeControlsMock;
    ui.addControlsTimeText = addControlsTimeTextMock;
    ui.addControlsRemovePlayback = addControlsRemovePlaybackMock;
    ui.addControlsPIP = addControlsPIPMock;
    ui.addControlsCloseCaptionButton = addControlsCloseCaptionButtonMock;
    ui.addControlsFullScreen = addControlsFullScreenMock;
    ui.addControlsSettingsButton = addControlsSettingsButtonMock;

    ui.addControlsWrapper();

    expect(ui.controlsWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsWrapper.className).toBe('controls-wrapper none');
    expect(ui.controlsWrapper.parentElement).toBe(ui.wrapper);

    expect(addControlsPlayPauseButtonMock).toHaveBeenCalledTimes(1);
    expect(addVolumeControlsMock).toHaveBeenCalledTimes(1);
    expect(addControlsTimeTextMock).toHaveBeenCalledTimes(1);
    expect(addControlsRemovePlaybackMock).toHaveBeenCalledTimes(1);
    expect(addControlsPIPMock).toHaveBeenCalledTimes(1);
    expect(addControlsCloseCaptionButtonMock).toHaveBeenCalledTimes(1);
    expect(addControlsFullScreenMock).toHaveBeenCalledTimes(1);
    expect(addControlsSettingsButtonMock).toHaveBeenCalledTimes(1);
  });

  test('addControlsPlayPauseButton', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    const originalTogglePlayPause = Utils.togglePlayPause;
    Utils.togglePlayPause = togglePlayPauseMock;

    ui.addControlsPlayPauseButton(parent);

    expect(ui.controlsPlayPauseButton).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsPlayPauseButton.className).toBe('icons');
    expect(ui.controlsPlayPauseButton.parentElement).toBe(parent);

    fireEvent.click(ui.controlsPlayPauseButton);

    expect(togglePlayPauseMock).toHaveBeenCalledTimes(1);

    Utils.togglePlayPause = originalTogglePlayPause;
  });

  test('addVolumeControls', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    const originalOnVolumeSliderChange = Utils.onVolumeSliderChange;
    Utils.onVolumeSliderChange = onVolumeSliderChange;

    const originalToggleMuteUnMute = Utils.toggleMuteUnMute;
    Utils.toggleMuteUnMute = toggleMuteUnMuteMock;

    ui.addVolumeControls(parent);

    expect(ui.controlsVolumeWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsVolumeWrapper.className).toBe('vertical-slider flex');
    expect(ui.controlsVolumeWrapper.parentElement).toBe(parent);

    expect(ui.controlsVolumeButton).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsVolumeButton.className).toBe('icons');
    expect(ui.controlsVolumeButton.parentElement).toBe(ui.controlsVolumeWrapper);
    expect(ui.controlsVolumeRangeInput).toBeInstanceOf(HTMLInputElement);
    expect(ui.controlsVolumeRangeInput.type).toBe('range');
    expect(ui.controlsVolumeRangeInput.min).toBe('0');
    expect(ui.controlsVolumeRangeInput.max).toBe('1');
    expect(ui.controlsVolumeRangeInput.step).toBe('any');
    expect(ui.controlsVolumeRangeInput.value).toBe(ui.volumeSliderValue);

    fireEvent.click(ui.controlsVolumeButton);
    expect(toggleMuteUnMuteMock).toHaveBeenCalledTimes(1);

    fireEvent.input(ui.controlsVolumeRangeInput, { target: { value: '0.5' } });
    expect(onVolumeSliderChange).toHaveBeenCalledTimes(1);
    expect(ui.controlsVolumeRangeInput.value).toBe('0.5');

    Utils.onVolumeSliderChange = originalOnVolumeSliderChange;
    Utils.toggleMuteUnMute = originalToggleMuteUnMute;
  });

  test('addControlsTimeText', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    ui.addControlsTimeText(parent);

    expect(ui.controlsTimeText).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsTimeText.className).toBe('time-text');
    expect(ui.controlsTimeText.parentElement).toBe(parent);
  });

  test('addControlsProgressBar', () => {
    const ui = new UI();

    ui.controlsWrapper = document.createElement('div');

    const originalOnVideoProgressChange = Utils.onVideoProgressChange;
    Utils.onVideoProgressChange = onVideoProgressChange;

    ui.addControlsProgressBar();

    expect(ui.controlsProgressBar).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsProgressBar.className).toBe('video-progress none');
    expect(ui.controlsProgressBar.parentElement).toBe(ui.controlsWrapper);
    expect(ui.controlsProgressRangeInput).toBeInstanceOf(HTMLInputElement);
    expect(ui.controlsProgressRangeInput.type).toBe('range');
    expect(ui.controlsProgressRangeInput.min).toBe('0');
    expect(ui.controlsProgressRangeInput.max).toBe('0');
    expect(ui.controlsProgressRangeInput.step).toBe('any');
    expect(ui.controlsProgressRangeInput.value).toBe(ui.progressSliderValue);

    fireEvent.input(ui.controlsProgressRangeInput, {
      target: { value: '0.5' },
    });

    expect(onVideoProgressChange).toHaveBeenCalledTimes(1);
    expect(ui.controlsProgressRangeInput.value).toBe('0.5');

    Utils.onVideoProgressChange = originalOnVideoProgressChange;
  });

  test('addControlsPIP', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    ui.addControlsPIP(parent);

    expect(ui.controlsPIP).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsPIP.className).toBe('icons none');
    expect(ui.controlsPIP.parentElement).toBe(parent);
  });

  test('addControlsRemovePlayback', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    ui.addControlsRemovePlayback(parent);

    expect(ui.controlsRemotePlaybackButton).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsRemotePlaybackButton.className).toBe('icons none');
    expect(ui.controlsRemotePlaybackButton.parentElement).toBe(parent);
  });

  test('addControlsCloseCaptionButton', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    ui.addControlsCloseCaptionMenu = addControlsCloseCaptionMenuMock;

    ui.addControlsCloseCaptionButton(parent);

    expect(ui.controlsCloseCaptionButton).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsCloseCaptionButton.className).toBe('icons none');
    expect(ui.controlsCloseCaptionButton.parentElement).toBe(parent);

    fireEvent.click(ui.controlsCloseCaptionButton);
    expect(addControlsCloseCaptionMenuMock).toHaveBeenCalledTimes(1);
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.CC);

    fireEvent.click(ui.controlsCloseCaptionButton);
    expect(addControlsCloseCaptionMenuMock).toHaveBeenCalledTimes(2);
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.NONE);
  });

  test('addControlsCloseCaptionMenu - if sub menu is not cc', () => {
    const ui = new UI();

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    ui.optionsMenuWrapper = document.createElement('div');

    ui.addControlsCloseCaptionMenu();

    expect(ui.optionsMenuWrapper.innerHTML).toBe('');

    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);

    Utils.toggleShowHide = originalToggleShowHide;
  });

  test('addControlsCloseCaptionMenu - if sub menu is cc', () => {
    vi.spyOn(sessionStorage, 'removeItem');
    vi.spyOn(sessionStorage, 'setItem');

    const ui = new UI();

    ui.player = {
      playerState: {
        textTracks: [{ lang: 'eng' }],
        selectedTextTrackId: null,
      },
    } as any;

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const originalSetSelectedTextTrack = Utils.setSelectedTextTrack;
    Utils.setSelectedTextTrack = setSelectedTextTrackMock;

    ui.optionsMenuWrapper = document.createElement('div') as any;
    ui.optionsMenuState = SETTINGS_SUB_MENU.CC;

    ui.addControlsCloseCaptionMenu();

    expect(ui.optionsMenuWrapper.innerHTML).not.toBe('');
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(ui.optionsMenuWrapper.style.right).toBe('70px');
    expect(ui.optionsMenuWrapper.childElementCount).toBe(2);
    expect(ui.optionsMenuWrapper.children[0].innerHTML).toBe(
      '<div class="head-item">Close Caption</div>',
    );
    expect(ui.optionsMenuWrapper.children[1].childElementCount).toBe(2);

    const offCC = getByRole(ui.optionsMenuWrapper, 'cc-off');
    const engCC = getByRole(ui.optionsMenuWrapper, 'cc-0');

    expect(offCC.innerHTML).toBe('<div class="menu-select"></div><div>Off</div>');
    expect(engCC.innerHTML).toBe('<div></div><div><div>English</div></div>');
    expect(offCC.firstElementChild?.className).toBe('menu-select');
    expect(engCC.firstElementChild?.className).toBe('');

    fireEvent.click(offCC);

    expect(setSelectedTextTrackMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.removeItem).toHaveBeenCalledTimes(1);

    fireEvent.click(engCC);

    expect(setSelectedTextTrackMock).toHaveBeenCalledTimes(2);
    expect(sessionStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);

    Utils.toggleShowHide = originalToggleShowHide;
    Utils.setSelectedTextTrack = originalSetSelectedTextTrack;
  });

  test('addControlsSettingsButton', () => {
    const ui = new UI();

    const parent = document.createElement('div');

    ui.addControlsSetingsMenu = addControlsSetingsMenuMock;

    ui.addControlsSettingsButton(parent);

    expect(ui.controlsSettingsButton).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsSettingsButton.className).toBe('icons');
    expect(ui.controlsSettingsButton.parentElement).toBe(parent);

    ui.optionsMenuState = SETTINGS_SUB_MENU.NONE;

    fireEvent.click(ui.controlsSettingsButton);
    expect(addControlsSetingsMenuMock).toHaveBeenCalledTimes(1);
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.SETINGS);

    ui.optionsMenuState = SETTINGS_SUB_MENU.CC;

    fireEvent.click(ui.controlsSettingsButton);
    expect(addControlsSetingsMenuMock).toHaveBeenCalledTimes(2);
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.SETINGS);

    fireEvent.click(ui.controlsSettingsButton);
    expect(addControlsSetingsMenuMock).toHaveBeenCalledTimes(3);
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.NONE);
  });

  test('addControlsSetingsMenu - if sub menu is none', () => {
    const ui = new UI();

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    ui.optionsMenuWrapper = document.createElement('div');

    ui.optionsMenuState = SETTINGS_SUB_MENU.NONE;

    ui.addControlsSetingsMenu();

    expect(ui.optionsMenuWrapper.innerHTML).toBe('');

    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);

    Utils.toggleShowHide = originalToggleShowHide;
  });

  test('addControlsSetingsMenu', () => {
    const ui = new UI();

    vi.spyOn(ui, 'addControlsSetingsMenu');

    const originalToggleShowHide = Utils.toggleShowHide;
    Utils.toggleShowHide = toggleShowHideMock;

    const originalSetCloseCaptionStyles = Utils.setCloseCaptionStyles;
    Utils.setCloseCaptionStyles = setCloseCaptionStylesMock;

    const originalGetCloseCaptionStyles = Utils.getCloseCaptionStyles;
    Utils.getCloseCaptionStyles = getCloseCaptionStylesMock.mockReturnValue({
      textSize: 'Default',
      textColor: 'Default',
      bgColor: 'Default',
      bgOpacity: 'Default',
    });

    const originalIsFullScreen = Utils.isFullScreen;
    Utils.isFullScreen = isFullScreenMock;

    ui.optionsMenuWrapper = document.createElement('div');

    ui.optionsMenuState = SETTINGS_SUB_MENU.SETINGS;

    ui.addControlsSetingsMenu();

    expect(ui.optionsMenuWrapper.innerHTML).not.toBe('');
    expect(ui.optionsMenuWrapper.style.right).toBe('10px');
    expect(toggleShowHideMock).toHaveBeenCalledTimes(1);
    expect(ui.optionsMenuWrapper.childElementCount).toBe(2);
    expect(ui.optionsMenuWrapper.children[0].innerHTML).toBe(
      '<div class="head-item">Settings</div>',
    );
    expect(ui.optionsMenuWrapper.children[1].childElementCount).toBe(1);

    const ccSettings = getByRole(ui.optionsMenuWrapper, 'cc-settings');
    expect(ccSettings).toBeTruthy();

    // cc options;
    fireEvent.click(ccSettings);

    expect(getCloseCaptionStylesMock).toHaveBeenCalledTimes(4);
    expect(queryByRole(ui.optionsMenuWrapper, 'cc-settings')).toBeFalsy();
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.CC_SETTINGS);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    // text size options;
    const textSize = getByRole(ui.optionsMenuWrapper, 'cc-settings-text-size');
    expect(textSize).toBeTruthy();

    fireEvent.click(textSize);

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.TEXT_SIZE);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    const textSizeKeys = Object.keys(SETTINGS_CC_TEXT_SIZE).map(
      (d) => `cc-settings-text-size-${d}`,
    );

    expect(textSizeKeys.length).toBe(6);

    const textSizeDefault = getByRole(ui.optionsMenuWrapper, textSizeKeys[0]);
    const textSize50 = getByRole(ui.optionsMenuWrapper, textSizeKeys[1]);
    const textSize75 = getByRole(ui.optionsMenuWrapper, textSizeKeys[2]);
    const textSize100 = getByRole(ui.optionsMenuWrapper, textSizeKeys[3]);
    const textSize150 = getByRole(ui.optionsMenuWrapper, textSizeKeys[4]);
    const textSize200 = getByRole(ui.optionsMenuWrapper, textSizeKeys[5]);
    const textSizeBackCC = getByRole(ui.optionsMenuWrapper, 'back-to-cc-settings');

    expect(textSizeDefault).toBeTruthy();
    expect(textSizeDefault.style.backgroundColor).toBe('#1c6fee');

    expect(textSize50).toBeTruthy();
    expect(textSize50.style.backgroundColor).toBe('');

    expect(textSize75).toBeTruthy();
    expect(textSize75.style.backgroundColor).toBe('');

    expect(textSize100).toBeTruthy();
    expect(textSize100.style.backgroundColor).toBe('');

    expect(textSize150).toBeTruthy();
    expect(textSize150.style.backgroundColor).toBe('');

    expect(textSize200).toBeTruthy();
    expect(textSize200.style.backgroundColor).toBe('');

    expect(textSizeBackCC).toBeTruthy();

    fireEvent.click(textSize50);

    expect(setCloseCaptionStylesMock).toHaveBeenCalled();

    fireEvent.click(textSizeBackCC);

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.CC_SETTINGS);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    // text color
    const textColor = getByRole(ui.optionsMenuWrapper, 'cc-settings-text-color');
    expect(textColor).toBeTruthy();

    fireEvent.click(textColor);

    const textColorBackCC = getByRole(ui.optionsMenuWrapper, 'back-to-cc-settings');

    expect(textColorBackCC).toBeTruthy();
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.TEXT_COLOR);

    const textColorKeys = Object.keys(SETTINGS_CC_COLORS).map((d) => `cc-settings-text-color-${d}`);

    expect(textColorKeys.length).toBe(9);

    const textColorDefault = getByRole(ui.optionsMenuWrapper, textColorKeys[0]);
    const textColorWhite = getByRole(ui.optionsMenuWrapper, textColorKeys[1]);
    const textColorBlack = getByRole(ui.optionsMenuWrapper, textColorKeys[2]);
    const textColorGray = getByRole(ui.optionsMenuWrapper, textColorKeys[3]);
    const textColorYellow = getByRole(ui.optionsMenuWrapper, textColorKeys[4]);
    const textColorGreen = getByRole(ui.optionsMenuWrapper, textColorKeys[5]);
    const textColorCyan = getByRole(ui.optionsMenuWrapper, textColorKeys[6]);
    const textColorBlue = getByRole(ui.optionsMenuWrapper, textColorKeys[7]);
    const textColorRed = getByRole(ui.optionsMenuWrapper, textColorKeys[8]);

    expect(textColorDefault).toBeTruthy();
    expect(textColorDefault.style.backgroundColor).toBe('#1c6fee');

    expect(textColorWhite).toBeTruthy();
    expect(textColorWhite.style.backgroundColor).toBe('');

    expect(textColorBlack).toBeTruthy();
    expect(textColorBlack.style.backgroundColor).toBe('');

    expect(textColorGray).toBeTruthy();
    expect(textColorGray.style.backgroundColor).toBe('');

    expect(textColorYellow).toBeTruthy();
    expect(textColorYellow.style.backgroundColor).toBe('');

    expect(textColorGreen).toBeTruthy();
    expect(textColorGreen.style.backgroundColor).toBe('');

    expect(textColorCyan).toBeTruthy();
    expect(textColorCyan.style.backgroundColor).toBe('');

    expect(textColorBlue).toBeTruthy();
    expect(textColorBlue.style.backgroundColor).toBe('');

    expect(textColorRed).toBeTruthy();
    expect(textColorRed.style.backgroundColor).toBe('');

    fireEvent.click(textColorBlack);

    expect(setCloseCaptionStylesMock).toHaveBeenCalled();

    fireEvent.click(textColorBackCC);

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.CC_SETTINGS);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    // test bg color
    const bgColor = getByRole(ui.optionsMenuWrapper, 'cc-settings-bg-color');
    expect(bgColor).toBeTruthy();

    fireEvent.click(bgColor);

    const bgColorBackCC = getByRole(ui.optionsMenuWrapper, 'back-to-cc-settings');

    expect(bgColorBackCC).toBeTruthy();
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.BG_COLOR);

    const bgColorKeys = Object.keys(SETTINGS_CC_COLORS).map((d) => `cc-settings-bg-color-${d}`);

    expect(bgColorKeys.length).toBe(9);

    const bgColorDefault = getByRole(ui.optionsMenuWrapper, bgColorKeys[0]);
    const bgColorWhite = getByRole(ui.optionsMenuWrapper, bgColorKeys[1]);
    const bgColorBlack = getByRole(ui.optionsMenuWrapper, bgColorKeys[2]);
    const bgColorGray = getByRole(ui.optionsMenuWrapper, bgColorKeys[3]);
    const bgColorYellow = getByRole(ui.optionsMenuWrapper, bgColorKeys[4]);
    const bgColorGreen = getByRole(ui.optionsMenuWrapper, bgColorKeys[5]);
    const bgColorCyan = getByRole(ui.optionsMenuWrapper, bgColorKeys[6]);
    const bgColorBlue = getByRole(ui.optionsMenuWrapper, bgColorKeys[7]);
    const bgColorRed = getByRole(ui.optionsMenuWrapper, bgColorKeys[8]);

    expect(bgColorDefault).toBeTruthy();
    expect(bgColorDefault.style.backgroundColor).toBe('#1c6fee');

    expect(bgColorWhite).toBeTruthy();
    expect(bgColorWhite.style.backgroundColor).toBe('');

    expect(bgColorBlack).toBeTruthy();
    expect(bgColorBlack.style.backgroundColor).toBe('');

    expect(bgColorGray).toBeTruthy();
    expect(bgColorGray.style.backgroundColor).toBe('');

    expect(bgColorYellow).toBeTruthy();
    expect(bgColorYellow.style.backgroundColor).toBe('');

    expect(bgColorGreen).toBeTruthy();
    expect(bgColorGreen.style.backgroundColor).toBe('');

    expect(bgColorCyan).toBeTruthy();
    expect(bgColorCyan.style.backgroundColor).toBe('');

    expect(bgColorBlue).toBeTruthy();
    expect(bgColorBlue.style.backgroundColor).toBe('');

    expect(bgColorRed).toBeTruthy();
    expect(bgColorRed.style.backgroundColor).toBe('');

    fireEvent.click(bgColorBlack);

    expect(setCloseCaptionStylesMock).toHaveBeenCalled();

    fireEvent.click(bgColorBackCC);

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.CC_SETTINGS);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    // bg opacity
    const bgOpacity = getByRole(ui.optionsMenuWrapper, 'cc-settings-bg-opacity');

    expect(bgOpacity).toBeTruthy();

    fireEvent.click(bgOpacity);

    const bgOpacityBackCC = getByRole(ui.optionsMenuWrapper, 'back-to-cc-settings');

    expect(bgOpacityBackCC).toBeTruthy();
    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.BG_OPACITY);

    const bgOpacityKeys = Object.keys(SETTINGS_CC_OPACITY).map(
      (d) => `cc-settings-bg-opacity-${d}`,
    );

    expect(bgOpacityKeys.length).toBe(5);

    const bgOpacityDefault = getByRole(ui.optionsMenuWrapper, bgOpacityKeys[0]);
    const bgOpacity25 = getByRole(ui.optionsMenuWrapper, bgOpacityKeys[1]);
    const bgOpacity50 = getByRole(ui.optionsMenuWrapper, bgOpacityKeys[2]);
    const bgOpacity75 = getByRole(ui.optionsMenuWrapper, bgOpacityKeys[3]);
    const bgOpacity100 = getByRole(ui.optionsMenuWrapper, bgOpacityKeys[4]);

    expect(bgOpacityDefault).toBeTruthy();
    expect(bgOpacityDefault.style.backgroundColor).toBe('#1c6fee');

    expect(bgOpacity25).toBeTruthy();
    expect(bgOpacity25.style.backgroundColor).toBe('');

    expect(bgOpacity50).toBeTruthy();
    expect(bgOpacity50.style.backgroundColor).toBe('');

    expect(bgOpacity75).toBeTruthy();
    expect(bgOpacity75.style.backgroundColor).toBe('');

    expect(bgOpacity100).toBeTruthy();
    expect(bgOpacity100.style.backgroundColor).toBe('');

    fireEvent.click(bgOpacity75);

    expect(setCloseCaptionStylesMock).toHaveBeenCalled();

    fireEvent.click(bgOpacityBackCC);

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.CC_SETTINGS);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    // CHECK IN END...
    const backToSettingsFromCC = getByRole(ui.optionsMenuWrapper, 'back-to-settings');
    expect(backToSettingsFromCC).toBeTruthy();

    fireEvent.click(backToSettingsFromCC);

    expect(ui.optionsMenuState).toBe(SETTINGS_SUB_MENU.SETINGS);
    expect(ui.addControlsSetingsMenu).toHaveBeenCalled();

    Utils.toggleShowHide = originalToggleShowHide;
    Utils.getCloseCaptionStyles = originalGetCloseCaptionStyles;
    Utils.isFullScreen = originalIsFullScreen;
    Utils.setCloseCaptionStyles = originalSetCloseCaptionStyles;
  });

  test('addControlsFullScreen', () => {
    const ui = new UI();

    const originalToggleFullScreen = Utils.toggleFullScreen;
    Utils.toggleFullScreen = toggleFullScreenMock;

    const parent = document.createElement('div');

    ui.addControlsFullScreen(parent);

    expect(ui.controlsFullScreen).toBeInstanceOf(HTMLDivElement);
    expect(ui.controlsFullScreen.className).toBe('icons');
    expect(ui.controlsFullScreen.parentElement).toBe(parent);

    fireEvent.click(ui.controlsFullScreen);

    expect(toggleFullScreenMock).toHaveBeenCalledTimes(1);

    Utils.toggleFullScreen = originalToggleFullScreen;
  });

  test('addContextMenu', () => {
    const ui = new UI();

    ui.mainWrapper = document.createElement('div');

    ui.addContextMenu();

    expect(ui.contextMenu).toBeInstanceOf(HTMLDivElement);
    expect(ui.contextMenu.className).toBe('context-menu');
    expect(ui.contextMenu.parentElement).toBe(ui.mainWrapper);
  });

  test('addVideoElement', () => {
    const ui = new UI();

    ui.media = document.createElement('div');

    const originalTogglePlayPause = Utils.togglePlayPause;
    Utils.togglePlayPause = togglePlayPauseMock;

    ui.addVideoElement();

    expect(ui.videoElement).toBeInstanceOf(HTMLVideoElement);
    expect(ui.videoElement).toHaveAttribute('preload', 'metadata');
    expect(ui.videoElement).toHaveAttribute('playsinline', 'true');
    expect(ui.videoElement).toHaveAttribute('webkit-playsinline', 'true');
    expect(ui.videoElement).toHaveAttribute('webkit-playsinline', 'true');
    expect(ui.videoElement).toHaveAttribute('x-webkit-airplay', 'allow');
    expect(ui.videoElement).toHaveAttribute('airplay', 'allow');
    expect(ui.videoElement.parentElement).toBe(ui.media);

    fireEvent.click(ui.videoElement);

    expect(togglePlayPauseMock).toHaveBeenCalledTimes(1);

    Utils.togglePlayPause = originalTogglePlayPause;
  });

  test('removeVideoPlayer', () => {
    const ui = new UI();

    ui.videoElement = {
      remove: vi.fn(),
    } as any;

    ui.removeVideoPlayer();

    expect(ui.videoElement.remove).toHaveBeenCalledTimes(1);
  });

  test('videoElementContextMenu', () => {
    const ui = new UI();

    const event: any = {
      preventDefault: vi.fn(),
    };

    const value = ui.videoElementContextMenu(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(value).toBe(false);
  });

  test('addOptionsMenuWrapper', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addOptionsMenuWrapper();

    expect(ui.optionsMenuWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.optionsMenuWrapper.className).toBe('options-menu none');
    expect(ui.optionsMenuWrapper.parentElement).toBe(ui.wrapper);
  });

  test('addErrorWrapper', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addErrorWrapper();

    expect(ui.errorWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.errorWrapper.className).toBe('error-wrapper');
    expect(ui.errorWrapper.parentElement).toBe(ui.wrapper);
  });

  test('addContentNotAvailableWrapper', () => {
    const ui = new UI();

    ui.wrapper = document.createElement('div');

    ui.addContentNotAvailableWrapper();

    expect(ui.contentNotAvailableWrapper).toBeInstanceOf(HTMLDivElement);
    expect(ui.contentNotAvailableWrapper.className).toBe('content-not-available');
    expect(ui.contentNotAvailableWrapper.parentElement).toBe(ui.wrapper);
  });

  test('getVideoElement', () => {
    const ui = new UI();

    ui.videoElement = document.createElement('video');

    const value = ui.getVideoElement();

    expect(value).toBe(ui.videoElement);
  });
});
