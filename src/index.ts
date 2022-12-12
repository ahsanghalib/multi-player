import { DRMEnums, EventsEnum, TextTrackLabels } from "./lib/types";
import { multiPlayer } from "./lib/MultiPlayer";
// (window as any).multiPlayer = multiPlayer;
// export default { multiPlayer };

export default {
  getPlayerState: multiPlayer.getPlayerState,
  getMediaElement: multiPlayer.getMediaElement,
  detachMediaElement: multiPlayer.detachMediaElement,
  setSource: multiPlayer.setSource,
  getCurrentConfig: multiPlayer.getCurrentConfig,
  updateConfig: multiPlayer.updateConfig,
  removeAllListeners: multiPlayer.removeAllListeners,
  on: multiPlayer.on,
  formatTime: multiPlayer.formatTime,
  isFullScreen: multiPlayer.isFullScreen,
  toggleFullScreen: multiPlayer.toggleFullScreen,
  togglePip: multiPlayer.togglePip,
  seekTime: multiPlayer.seekTime,
  toggleForwardRewind: multiPlayer.toggleForwardRewind,
  toggleMuteUnMute: multiPlayer.toggleMuteUnMute,
  togglePlayPause: multiPlayer.togglePlayPause,
  retry: multiPlayer.retry,
  setTextTrack: multiPlayer.setTextTrack,
  removePlayer: multiPlayer.removePlayer,
  DRMEnums,
  EventsEnum,
  TextTrackLabels,
};
