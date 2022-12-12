import { DRMEnums, EventsEnum, TextTrackLabels } from "./lib/types";
import { multiPlayer } from "./lib/MultiPlayer";
(window as any).multiPlayer = multiPlayer;
export default { multiPlayer };
