/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Player } from './player';
import {
  SETTINGS_CC_COLORS,
  SETTINGS_CC_OPACITY,
  SETTINGS_CC_TEXT_SIZE,
  SETTINGS_SUB_MENU,
  STORAGE_KEYS,
  TextTrackLabels,
} from './types';
import { Utils } from './utils';

export class UI {
  player!: Player;
  container!: HTMLDivElement;
  containerWrapper!: HTMLDivElement;
  mainWrapper!: HTMLDivElement;
  contextMenu!: HTMLDivElement;
  contextLogoUrl = '';
  contextMenuTimer: NodeJS.Timeout | null = null;
  wrapper!: HTMLDivElement;
  media!: HTMLDivElement;
  videoElement!: HTMLVideoElement;
  closeCaptionsContainer!: HTMLDivElement;
  loaderWrapper!: HTMLDivElement;
  endedWrapper!: HTMLDivElement;
  replayButton!: HTMLDivElement;
  errorWrapper!: HTMLDivElement;
  contentNotAvailableWrapper!: HTMLDivElement;
  controlsWrapper!: HTMLDivElement;
  showControlsTimer: NodeJS.Timeout | null = null;
  controlsPlayPauseButton!: HTMLDivElement;
  controlsVolumeWrapper!: HTMLDivElement;
  controlsVolumeButton!: HTMLDivElement;
  controlsVolumeRangeInput!: HTMLInputElement;
  controlsTimeText!: HTMLDivElement;
  controlsProgressBar!: HTMLDivElement;
  controlsProgressRangeInput!: HTMLInputElement;
  controlsPIP!: HTMLDivElement;
  controlsRemotePlaybackButton!: HTMLDivElement;
  controlsCloseCaptionButton!: HTMLDivElement;
  controlsFullScreen!: HTMLDivElement;
  controlsSettingsButton!: HTMLDivElement;
  optionsMenuWrapper!: HTMLDivElement;

  // casting ui
  castingWrapper!: HTMLDivElement;
  castingTitle!: HTMLDivElement;
  castingIconsContainer!: HTMLDivElement;
  castingPlayPauseButton!: HTMLDivElement;
  castingCloseCaptionButton!: HTMLDivElement;
  castingVolumeButtoon!: HTMLDivElement;
  castingRemotePlaybackButton!: HTMLDivElement;
  castingRewindButton!: HTMLDivElement;
  castingForwardButton!: HTMLDivElement;
  castingRestartPlayButton!: HTMLDivElement;

  // values
  volumeSliderValue = '0';
  progressSliderValue = '0';
  isElementsAdded = false;
  isCastingUIAdded = false;

  optionsMenuState = SETTINGS_SUB_MENU.NONE;

  constructor() {
    /* don't need any initialization here */
  }

  setContainer = (player: Player, elem: HTMLDivElement, contextLogoUrl = '') => {
    this.player = player;
    this.container = elem;
    this.container.style.backgroundColor = '#000';
    this.contextLogoUrl = contextLogoUrl;
    this.addContainerWrapper();
    if (!this.isElementsAdded) this.addElements();
    Utils.toggleWrappers({ ui: this, none: true });
  };

  addElements = () => {
    this.addMainWrapper();
    this.addAspectRatio();
    this.addWrapperDiv();
    this.addMediaDiv();
    this.addVideoElement();
    this.addCloseCaptionContainer();
    this.addLoaderWrapper();
    this.addEndedWrapper();
    this.addControlsWrapper();
    this.addControlsProgressBar();
    this.addOptionsMenuWrapper();
    this.addContextMenu();
    this.addErrorWrapper();
    this.addContentNotAvailableWrapper();
    this.isElementsAdded = true;
  };

  removeUI = () => {
    if (!this.isElementsAdded) return;
    this.mainWrapper.remove();
    this.isElementsAdded = false;
  };

  removeCastingUIElements = () => {
    if (!this.isCastingUIAdded) return;
    this.castingWrapper.remove();
    this.isCastingUIAdded = false;
    this.isElementsAdded = false;
  };

  removeAllUI = () => {
    if (!this.isElementsAdded) return;
    this.containerWrapper.remove();
    this.isCastingUIAdded = false;
    this.isElementsAdded = false;
  };

  create = (args: {
    tag: string;
    parent: HTMLElement;
    classListAdd?: string[];
    className?: string;
    id?: string;
    innerHTML?: string;
    innerText?: string;
  }) => {
    const el = document.createElement(args.tag) as any;
    if (args.classListAdd) el.classList.add(...args.classListAdd);
    if (args.className) el.className = args.className;
    if (args.id) el.id = args.id;
    if (args.innerHTML) el.innerHTML = args.innerHTML;
    if (args.innerText) el.innerText = args.innerText;
    args.parent.appendChild(el);
    return el;
  };

  addContainerWrapper = () => {
    if (!document.getElementById('media-player-main-wrappper')) {
      this.containerWrapper = this.create({
        tag: 'div',
        parent: this.container,
        className: 'wrapper',
        id: 'media-player-main-wrappper',
      });
    }
  };

  addMainWrapper = () => {
    this.mainWrapper = this.create({
      tag: 'div',
      parent: this.containerWrapper,
      className: 'media-player',
    });
    if (this.contextLogoUrl) {
      this.mainWrapper.oncontextmenu = this.mainWrapperContextMenu.bind(this);
    }
    this.mainWrapper.onclick = this.mainWrapperClick.bind(this);
    this.mainWrapper.onmouseenter = this.mainWrapperMouseEnter.bind(this);
    this.mainWrapper.onmousemove = this.mainWrapperMouseEnter.bind(this);
    this.mainWrapper.onmouseleave = this.mainWrapperMouseLeave.bind(this);
  };

  addMediaDiv = () => {
    this.media = this.create({
      tag: 'div',
      parent: this.wrapper,
      className: 'media',
    });
  };

  addWrapperDiv = () => {
    this.wrapper = this.create({
      tag: 'div',
      parent: this.mainWrapper,
      className: 'wrapper',
    });
  };

  addAspectRatio = () => {
    this.create({
      tag: 'div',
      parent: this.mainWrapper,
      className: 'aspect reset',
    });
  };

  mainWrapperMouseEnter = () => {
    if (this.showControlsTimer) clearTimeout(this.showControlsTimer);
    const playerState = this.player.getPlayerState();
    if (playerState.loaded && playerState.uiState !== 'error' && playerState.uiState !== 'ended') {
      Utils.toggleOpacity(this.controlsWrapper, true);
    }
  };

  mainWrapperMouseLeave = () => {
    if (this.showControlsTimer) clearTimeout(this.showControlsTimer);
    if (this.optionsMenuWrapper.classList.contains('flex')) return;
    this.showControlsTimer = setTimeout(() => {
      Utils.toggleOpacity(this.controlsWrapper, false);
    }, 1000);
  };

  mainWrapperContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    const { x, y, width, height } = this.mainWrapper.getBoundingClientRect();
    this.contextMenu.style.display = `block`;
    const { clientWidth: contextWidth, clientHeight: contextHeight } = this.contextMenu;
    const maxWidth = x + width - contextWidth - 5;
    const maxHeight = y + height - contextHeight - 5;
    const top = clientY > maxHeight ? maxHeight : clientY;
    const left = clientX > maxWidth ? maxWidth : clientX;
    this.contextMenu.style.top = `${top}px`;
    this.contextMenu.style.left = `${left}px`;
    this.hideContextMenu(true);
  };

  hideContextMenu = (timer: boolean) => {
    if (this.contextMenuTimer) clearTimeout(this.contextMenuTimer);
    if (timer) {
      this.contextMenuTimer = setTimeout(() => (this.contextMenu.style.display = `none`), 5 * 1000);
    } else {
      this.contextMenu.style.display = `none`;
    }
  };

  mainWrapperClick = (e: MouseEvent) => {
    e.preventDefault();
    this.hideContextMenu(false);
  };

  addCloseCaptionContainer = () => {
    this.closeCaptionsContainer = this.create({
      tag: 'div',
      parent: this.wrapper,
      className: 'close-captions-container',
    });
  };

  addLoaderWrapper = () => {
    this.loaderWrapper = this.create({
      tag: 'div',
      parent: this.wrapper,
      className: 'loader-wrapper',
      innerHTML: `<div class="loader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`,
    });
  };

  addEndedWrapper = () => {
    this.endedWrapper = this.create({
      tag: 'div',
      parent: this.wrapper,
      className: 'ended-wrapper',
    });
    this.replayButton = this.create({
      tag: 'div',
      parent: this.endedWrapper,
      className: 'icons',
      innerHTML: Utils.Icons({ type: 'replay' }),
    });
    this.endedWrapper.onclick = () => Utils.onEndedReplay(this);
  };

  addControlsWrapper = () => {
    this.controlsWrapper = this.create({
      tag: 'div',
      parent: this.wrapper,
      classListAdd: ['controls-wrapper', 'none'],
    });
    const main = this.create({
      tag: 'div',
      parent: this.controlsWrapper,
      className: 'controls',
    });
    const first = this.create({
      tag: 'div',
      parent: main,
      className: 'controls-first',
    });
    const second = this.create({
      tag: 'div',
      parent: main,
      className: 'controls-second',
    });
    this.addControlsPlayPauseButton(first);
    this.addVolumeControls(first);
    this.addControlsTimeText(first);

    this.addControlsRemovePlayback(second);
    this.addControlsPIP(second);
    this.addControlsCloseCaptionButton(second);
    this.addControlsFullScreen(second);
    this.addControlsSettingsButton(second);
  };

  addControlsPlayPauseButton = (parent: HTMLElement) => {
    this.controlsPlayPauseButton = this.create({
      tag: 'div',
      parent,
      className: 'icons',
      innerHTML: Utils.Icons({ type: 'pause' }),
    });

    this.controlsPlayPauseButton.onclick = async () => {
      await Utils.togglePlayPause(this);
    };
  };

  addVolumeControls = (parent: HTMLElement) => {
    this.controlsVolumeWrapper = this.create({
      tag: 'div',
      parent,
      classListAdd: ['vertical-slider', 'flex'],
    });
    this.controlsVolumeButton = this.create({
      tag: 'div',
      parent: this.controlsVolumeWrapper,
      className: 'icons',
      innerHTML: Utils.Icons({ type: 'volume_off' }),
    });
    this.controlsVolumeButton.onclick = () => {
      Utils.toggleMuteUnMute(this);
    };
    const volumeRangeWrapper = this.create({
      tag: 'div',
      parent: this.controlsVolumeWrapper,
      className: 'volume-range',
    });
    this.controlsVolumeRangeInput = this.create({
      tag: 'input',
      parent: volumeRangeWrapper,
    });
    this.controlsVolumeRangeInput.type = 'range';
    this.controlsVolumeRangeInput.min = '0';
    this.controlsVolumeRangeInput.max = '1';
    this.controlsVolumeRangeInput.step = 'any';
    this.controlsVolumeRangeInput.value = this.volumeSliderValue;

    this.controlsVolumeRangeInput.oninput = (e: any) => Utils.onVolumeSliderChange(this, e);
  };

  addControlsTimeText = (parent: HTMLElement) => {
    this.controlsTimeText = this.create({
      tag: 'div',
      parent,
      className: 'time-text',
    });
  };

  addControlsProgressBar = () => {
    this.controlsProgressBar = this.create({
      tag: 'div',
      parent: this.controlsWrapper,
      classListAdd: ['video-progress', 'none'],
    });
    this.controlsProgressRangeInput = this.create({
      tag: 'input',
      parent: this.controlsProgressBar,
    });
    this.controlsProgressRangeInput.type = 'range';
    this.controlsProgressRangeInput.min = '0';
    this.controlsProgressRangeInput.max = '0';
    this.controlsProgressRangeInput.step = 'any';
    this.controlsProgressRangeInput.value = this.progressSliderValue;

    this.controlsProgressRangeInput.oninput = (e: any) => Utils.onVideoProgressChange(this, e);
  };

  addControlsPIP = (parent: HTMLElement) => {
    this.controlsPIP = this.create({
      tag: 'div',
      parent,
      classListAdd: ['icons', 'none'],
    });

    this.controlsPIP.onclick = () => Utils.togglePip(this);
  };

  addControlsRemovePlayback = (parent: HTMLElement) => {
    this.controlsRemotePlaybackButton = this.create({
      tag: 'div',
      parent,
      classListAdd: ['icons', 'none'],
    });
  };

  addControlsCloseCaptionButton = (parent: HTMLElement) => {
    this.controlsCloseCaptionButton = this.create({
      tag: 'div',
      parent,
      classListAdd: ['icons', 'none'],
    });

    this.controlsCloseCaptionButton.onclick = () => {
      if (this.optionsMenuState !== SETTINGS_SUB_MENU.CC) {
        this.optionsMenuState = SETTINGS_SUB_MENU.CC;
        this.addControlsCloseCaptionMenu();
      } else {
        this.optionsMenuState = SETTINGS_SUB_MENU.NONE;
        this.addControlsCloseCaptionMenu();
      }
    };
  };

  addControlsCloseCaptionMenu = () => {
    this.optionsMenuWrapper.innerHTML = '';
    if (this.optionsMenuState === SETTINGS_SUB_MENU.CC) {
      Utils.toggleShowHide(this.optionsMenuWrapper, 'flex');
      this.optionsMenuWrapper.style.right = '70px';

      const tracks = this.player.playerState.textTracks;
      const selected = this.player.playerState.selectedTextTrackId;

      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerText: 'Close Caption',
      });

      const menu = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const ccMenuItemOff: HTMLDivElement = this.create({
        tag: 'div',
        parent: menu,
        className: 'cc-menu-item',
      });

      ccMenuItemOff.setAttribute('role', 'cc-off');

      ccMenuItemOff.onclick = () => {
        Utils.setSelectedTextTrack(this, null);
        sessionStorage.removeItem(STORAGE_KEYS.CC_ID);
      };

      this.create({
        tag: 'div',
        parent: ccMenuItemOff,
        className: selected === null ? 'menu-select' : '',
      });

      this.create({
        tag: 'div',
        parent: ccMenuItemOff,
        innerText: 'Off',
      });

      tracks.forEach((t, idx) => {
        const ccMenuItem = this.create({
          tag: 'div',
          parent: menu,
          className: 'cc-menu-item',
        });
        ccMenuItem.setAttribute('role', `cc-${idx}`);
        ccMenuItem.onclick = () => {
          Utils.setSelectedTextTrack(this, String(idx));
          sessionStorage.setItem(STORAGE_KEYS.CC_ID, String(idx));
        };
        this.create({
          tag: 'div',
          parent: ccMenuItem,
          className: selected === idx.toString() ? 'menu-select' : '',
        });
        this.create({
          tag: 'div',
          parent: ccMenuItem,
          // @ts-ignore
          innerHTML: `<div>${TextTrackLabels[t.lang] || 'English'}</div>`,
        });
      });
    } else {
      Utils.toggleShowHide(this.optionsMenuWrapper, 'none');
    }
  };

  addControlsSettingsButton = (parent: HTMLElement) => {
    this.controlsSettingsButton = this.create({
      tag: 'div',
      parent,
      className: 'icons',
      innerHTML: Utils.Icons({ type: 'settings' }),
    });
    this.controlsSettingsButton.onclick = () => {
      if (
        this.optionsMenuState === SETTINGS_SUB_MENU.NONE ||
        this.optionsMenuState === SETTINGS_SUB_MENU.CC
      ) {
        this.optionsMenuState = SETTINGS_SUB_MENU.SETINGS;
        this.addControlsSetingsMenu();
      } else {
        this.optionsMenuState = SETTINGS_SUB_MENU.NONE;
        this.addControlsSetingsMenu();
      }
    };
  };

  addControlsSetingsMenu = () => {
    this.optionsMenuWrapper.innerHTML = '';
    if (this.optionsMenuState === SETTINGS_SUB_MENU.NONE) {
      Utils.toggleShowHide(this.optionsMenuWrapper, 'none');
      return;
    }

    Utils.toggleShowHide(this.optionsMenuWrapper, 'flex');
    this.optionsMenuWrapper.style.right = '10px';

    if (this.optionsMenuState === SETTINGS_SUB_MENU.SETINGS) {
      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerText: 'Settings',
      });

      const menu: HTMLDivElement = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const menuItem: HTMLDivElement = this.create({
        tag: 'div',
        parent: menu,
        className: 'menu-item',
        innerHTML: `<div>Close Caption</div><div>Options</div>`,
      });

      menuItem.setAttribute('role', 'cc-settings');

      menuItem.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
        this.addControlsSetingsMenu();
      };

      return;
    }

    if (this.optionsMenuState === SETTINGS_SUB_MENU.CC_SETTINGS) {
      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      head.style.cursor = 'pointer';

      head.setAttribute('role', 'back-to-settings');

      head.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.SETINGS;
        this.addControlsSetingsMenu();
      };

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerHTML: `${Utils.Icons({
          type: 'arrow_back',
          iconSize: '12px',
        })}<div>Close Caption Options</div>`,
      });

      const menu: HTMLDivElement = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const textSize: HTMLDivElement = this.create({
        tag: 'div',
        parent: menu,
        className: 'menu-item',
        innerHTML: `<div>Text Size</div><div>${Utils.getCloseCaptionStyles().textSize}</div>`,
      });

      textSize.setAttribute('role', 'cc-settings-text-size');

      textSize.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.TEXT_SIZE;
        this.addControlsSetingsMenu();
      };

      const textColor: HTMLDivElement = this.create({
        tag: 'div',
        parent: menu,
        className: 'menu-item',
        innerHTML: `<div>Text Color</div><div>${Utils.getCloseCaptionStyles().textColor}</div>`,
      });

      textColor.setAttribute('role', 'cc-settings-text-color');

      textColor.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.TEXT_COLOR;
        this.addControlsSetingsMenu();
      };

      const bgColor: HTMLDivElement = this.create({
        tag: 'div',
        parent: menu,
        className: 'menu-item',
        innerHTML: `<div>Background Color</div><div>${Utils.getCloseCaptionStyles().bgColor}</div>`,
      });

      bgColor.setAttribute('role', 'cc-settings-bg-color');

      bgColor.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.BG_COLOR;
        this.addControlsSetingsMenu();
      };

      const bgOpacity: HTMLDivElement = this.create({
        tag: 'div',
        parent: menu,
        className: 'menu-item',
        innerHTML: `<div>Background Opacity</div><div>${
          Utils.getCloseCaptionStyles().bgOpacity
        }</div>`,
      });

      bgOpacity.setAttribute('role', 'cc-settings-bg-opacity');

      bgOpacity.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.BG_OPACITY;
        this.addControlsSetingsMenu();
      };

      return;
    }

    if (this.optionsMenuState === SETTINGS_SUB_MENU.TEXT_SIZE) {
      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      head.style.cursor = 'pointer';

      head.setAttribute('role', 'back-to-cc-settings');

      head.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
        this.addControlsSetingsMenu();
      };

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerHTML: `${Utils.Icons({
          type: 'arrow_back',
          iconSize: '12px',
        })}<div>Text Size</div>`,
      });

      const menu: HTMLDivElement = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const currentValue = Utils.getCloseCaptionStyles().textSize;

      Object.keys(SETTINGS_CC_TEXT_SIZE).forEach((d) => {
        const item = this.create({
          tag: 'div',
          parent: menu,
          className: 'menu-item-options',
          innerHTML: `<div>${d}</div>`,
        });
        item.setAttribute('role', `cc-settings-text-size-${d}`);
        item.style.backgroundColor = currentValue === d ? '#1c6fee' : '';
        item.onclick = () => {
          this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
          Utils.setCloseCaptionStyles(
            this,
            {
              // @ts-ignore
              textSize: SETTINGS_CC_TEXT_SIZE[d],
            },
            Utils.isFullScreen(),
          );
          this.addControlsSetingsMenu();
        };
      });

      return;
    }

    if (this.optionsMenuState === SETTINGS_SUB_MENU.TEXT_COLOR) {
      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      head.style.cursor = 'pointer';

      head.setAttribute('role', 'back-to-cc-settings');

      head.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
        this.addControlsSetingsMenu();
      };

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerHTML: `${Utils.Icons({
          type: 'arrow_back',
          iconSize: '12px',
        })}<div>Text Color</div>`,
      });

      const menu: HTMLDivElement = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const currentValue = Utils.getCloseCaptionStyles().textColor;

      Object.keys(SETTINGS_CC_COLORS).forEach((d) => {
        const item = this.create({
          tag: 'div',
          parent: menu,
          className: 'menu-item-options',
          innerHTML: `<div>${d}</div>`,
        });
        item.setAttribute('role', `cc-settings-text-color-${d}`);
        item.style.backgroundColor = currentValue === d ? '#1c6fee' : '';
        item.onclick = () => {
          this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
          Utils.setCloseCaptionStyles(
            this,
            {
              // @ts-ignore
              textColor: SETTINGS_CC_COLORS[d],
            },
            Utils.isFullScreen(),
          );
          this.addControlsSetingsMenu();
        };
      });

      return;
    }

    if (this.optionsMenuState === SETTINGS_SUB_MENU.BG_COLOR) {
      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      head.style.cursor = 'pointer';

      head.setAttribute('role', 'back-to-cc-settings');

      head.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
        this.addControlsSetingsMenu();
      };

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerHTML: `${Utils.Icons({
          type: 'arrow_back',
          iconSize: '12px',
        })}<div>Background Color</div>`,
      });

      const menu: HTMLDivElement = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const currentValue = Utils.getCloseCaptionStyles().bgColor;

      Object.keys(SETTINGS_CC_COLORS).forEach((d) => {
        const item = this.create({
          tag: 'div',
          parent: menu,
          className: 'menu-item-options',
          innerHTML: `<div>${d}</div>`,
        });
        item.setAttribute('role', `cc-settings-bg-color-${d}`);
        item.style.backgroundColor = currentValue === d ? '#1c6fee' : '';
        item.onclick = () => {
          this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
          Utils.setCloseCaptionStyles(
            this,
            {
              // @ts-ignore
              bgColor: SETTINGS_CC_COLORS[d],
            },
            Utils.isFullScreen(),
          );
          this.addControlsSetingsMenu();
        };
      });

      return;
    }

    if (this.optionsMenuState === SETTINGS_SUB_MENU.BG_OPACITY) {
      const head = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'head',
      });

      head.style.cursor = 'pointer';

      head.setAttribute('role', 'back-to-cc-settings');

      head.onclick = () => {
        this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
        this.addControlsSetingsMenu();
      };

      this.create({
        tag: 'div',
        parent: head,
        className: 'head-item',
        innerHTML: `${Utils.Icons({
          type: 'arrow_back',
          iconSize: '12px',
        })}<div>Backgroud Opacity</div>`,
      });

      const menu: HTMLDivElement = this.create({
        tag: 'div',
        parent: this.optionsMenuWrapper,
        className: 'menu',
      });

      const currentValue = Utils.getCloseCaptionStyles().bgOpacity;

      Object.keys(SETTINGS_CC_OPACITY).forEach((d) => {
        const item = this.create({
          tag: 'div',
          parent: menu,
          className: 'menu-item-options',
          innerHTML: `<div>${d}</div>`,
        });
        item.setAttribute('role', `cc-settings-bg-opacity-${d}`);
        item.style.backgroundColor = currentValue === d ? '#1c6fee' : '';
        item.onclick = () => {
          this.optionsMenuState = SETTINGS_SUB_MENU.CC_SETTINGS;
          Utils.setCloseCaptionStyles(
            this,
            {
              // @ts-ignore
              bgOpacity: SETTINGS_CC_OPACITY[d],
            },
            Utils.isFullScreen(),
          );
          this.addControlsSetingsMenu();
        };
      });
    }
  };

  addControlsFullScreen = (parent: HTMLElement) => {
    this.controlsFullScreen = this.create({
      tag: 'div',
      parent,
      className: 'icons',
      innerHTML: Utils.Icons({ type: 'fullscreen_enter' }),
    });
    this.controlsFullScreen.onclick = () => Utils.toggleFullScreen(this);
  };

  addContextMenu = () => {
    this.contextMenu = this.create({
      tag: 'div',
      parent: this.mainWrapper,
      className: 'context-menu',
    });
    const item = this.create({
      tag: 'div',
      parent: this.contextMenu,
      className: 'item',
    });
    const img = this.create({ tag: 'img', parent: item });
    img.src = this.contextLogoUrl || '';
    img.alt = 'Logo';
    this.create({ tag: 'div', parent: item, className: 'text' }).innerText = 'Player';
  };

  addVideoElement = () => {
    this.videoElement = this.create({ tag: 'video', parent: this.media });
    this.videoElement.setAttribute('preload', 'metadata');
    this.videoElement.setAttribute('playsinline', 'true');
    this.videoElement.setAttribute('webkit-playsinline', 'true');
    this.videoElement.setAttribute('x-webkit-airplay', 'allow');
    this.videoElement.setAttribute('airplay', 'allow');
    this.videoElement.oncontextmenu = this.videoElementContextMenu.bind(this);
    this.videoElement.onclick = async () => {
      await Utils.togglePlayPause(this);
    };
  };

  removeVideoPlayer = () => {
    this.videoElement.remove();
  };

  videoElementContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };

  addOptionsMenuWrapper = () => {
    this.optionsMenuWrapper = this.create({
      tag: 'div',
      parent: this.wrapper,
      classListAdd: ['options-menu', 'none'],
    });
  };

  addErrorWrapper = () => {
    this.errorWrapper = this.create({
      tag: 'div',
      parent: this.wrapper,
      className: 'error-wrapper',
      innerHTML: `<div class="error-msg"><div style="cursor: auto"></div><div>ERROR</div></div>`,
    });
  };

  addContentNotAvailableWrapper = () => {
    this.contentNotAvailableWrapper = this.create({
      tag: 'div',
      parent: this.wrapper,
      className: 'content-not-available',
      innerHTML: `<div class="content-msg"><div style="cursor: auto"></div><div>Content is currently unavailable.</div></div>`,
    });
  };

  getVideoElement = () => {
    return this.videoElement;
  };

  // casting ui
  addCastingUIElements = () => {
    if (!document.getElementById('media-player-casting-wrapper')) {
      this.castingWrapper = this.create({
        tag: 'div',
        id: 'media-player-casting-wrapper',
        parent: this.containerWrapper,
        className: 'cast-overlay-container',
      });
      this.castingWrapper.oncontextmenu = (e: any) => {
        e.preventDefault();
      };
      this.addCastingTtile();
      this.addCastingIconsContainer();
      this.addCastingRewindButton();
      this.addCastingPlayPauseButton();
      this.addCastingForwardButton();
      this.addCastingRestartPlayButton();
      this.addCastingCloseCaptionButton();
      this.addCastingVolumeButtoon();
      this.addCastingRemotePlaybackButton();
      this.isCastingUIAdded = true;
    }
  };

  addCastingTtile = () => {
    this.castingTitle = this.create({
      tag: 'div',
      parent: this.castingWrapper,
      className: 'title',
    });
  };

  addCastingIconsContainer = () => {
    this.castingIconsContainer = this.create({
      tag: 'div',
      parent: this.castingWrapper,
      classListAdd: ['icons-container'],
    });
  };

  addCastingPlayPauseButton = () => {
    this.castingPlayPauseButton = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      classListAdd: ['icons', 'none'],
      innerHTML: Utils.Icons({ type: 'play' }),
    });
  };

  addCastingCloseCaptionButton = () => {
    this.castingCloseCaptionButton = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      classListAdd: ['icons', 'none'],
      innerHTML: Utils.Icons({ type: 'cc_disabled' }),
    });
  };

  addCastingVolumeButtoon = () => {
    this.castingVolumeButtoon = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      classListAdd: ['icons', 'none'],
      innerHTML: Utils.Icons({ type: 'volume_up' }),
    });
  };

  addCastingRemotePlaybackButton = () => {
    this.castingRemotePlaybackButton = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      className: 'icons',
      innerHTML: Utils.Icons({ type: 'cast_exit' }),
    });
  };

  addCastingRewindButton = () => {
    this.castingRewindButton = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      classListAdd: ['icons', 'none'],
      innerHTML: Utils.Icons({ type: 'rewind' }),
    });
  };

  addCastingForwardButton = () => {
    this.castingForwardButton = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      classListAdd: ['icons', 'none'],
      innerHTML: Utils.Icons({ type: 'forward' }),
    });
  };

  addCastingRestartPlayButton = () => {
    this.castingRestartPlayButton = this.create({
      tag: 'div',
      parent: this.castingIconsContainer,
      classListAdd: ['icons', 'none'],
      innerHTML: Utils.Icons({ type: 'replay' }),
    });
  };
}
