import { playerInstance } from './player';
import { DRMEnums } from './types';

const player = {
  instance: playerInstance,
  DRMEnums: DRMEnums,
  init: playerInstance.init,
  getVideoElement: playerInstance.ui.getVideoElement,
  getPlayerState: playerInstance.getPlayerState,
  setPlayerState: playerInstance.setPlayerState,
  unmount: playerInstance.unmount,
  removePlayer: playerInstance.removePlayer,
  onTogglePlayPause: playerInstance.onTogglePlayPause,
  onToggleMuteUnMute: playerInstance.onToggleMuteUnMute,
  onToggleForwardRewind: playerInstance.onToggleForwardRewind,
  onSeekTime: playerInstance.onSeekTime,
  onTogglePip: playerInstance.onTogglePip,
  onToggleFullScreen: playerInstance.onToggleFullScreen,
  onEndedReplay: playerInstance.onEndedReplay,
  setCastingSource: playerInstance.castSender.sendSourceInfo,
  setCastingMediaInfo: playerInstance.castSender.sendMediaInfo,
  stopCasting: playerInstance.castSender.stopCasting,
};

export { player as default, DRMEnums };
