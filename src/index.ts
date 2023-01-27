import { DRMEnums, EventsEnum, TextTrackLabels } from "./lib/types";
import { multiPlayerInstance } from "./lib/MultiPlayer";

const {
  getMediaElement,
  getPlayerState,
  detachMediaElement,
  setSource,
  getCurrentConfig,
  updateConfig,
  removeAllListeners,
  on,
  formatTime,
  isFullScreen,
  toggleFullScreen,
  togglePip,
  seekTime,
  toggleForwardRewind,
  toggleMuteUnMute,
  togglePlayPause,
  retry,
  setTextTrack,
  removePlayer,
} = multiPlayerInstance;

const player = {
  getPlayerState,
  getMediaElement,
  detachMediaElement,
  setSource,
  getCurrentConfig,
  updateConfig,
  removeAllListeners,
  on,
  formatTime,
  isFullScreen,
  toggleFullScreen,
  togglePip,
  seekTime,
  toggleForwardRewind,
  toggleMuteUnMute,
  togglePlayPause,
  retry,
  setTextTrack,
  removePlayer,
  DRMEnums,
  EventsEnum,
  TextTrackLabels,
};

export default player;