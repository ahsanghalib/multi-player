import { MultiPlayer } from "./MultiPlayer";
import { EventsEnum, IEvents, Listener } from "./types";

export class Events {
  private _events: IEvents;
  private _player: MultiPlayer;

  constructor(player: MultiPlayer) {
    this._events = {};
    this._player = player;
  }

  on = (event: EventsEnum, fn: Listener) => {
    if (typeof this._events[event] !== "object") this._events[event] = [];
    this._events[event].push(fn);
    return () => this.removeListener(event, fn);
  };

  emit = (
    event: EventsEnum,
    args: {
      value?: boolean | number | string | Array<any>;
      detail?: any;
    }
  ) => {
    if (typeof this._events[event] !== "object") return;
    [...this._events[event]].forEach((listener) =>
      listener.apply(this, [{ event, ...args }])
    );
  };

  removeListener = (event: EventsEnum, listener: Listener) => {
    if (typeof this._events[event] !== "object") return;
    const idx: number = this._events[event].indexOf(listener);
    if (idx > -1) {
      this._events[event].splice(idx, 1);
    }
  };

  removeAllListeners = () => {
    this._events = {};
  };

  fatalErrorRetry = (d: any) => {
    const maxCount = this._player.getCurrentConfig().maxRetryCount;
    const currentCount = this._player.getRetryCount();
    console.log("RETRY #", currentCount);
    if (currentCount === maxCount) {
      this.loadingErrorEvents(false, true, d);
      return;
    }
    this._player.increaseRetryCount();
    this._player.retry();
  };

  loadingErrorEvents = (loading: boolean, error: boolean, detail?: any) => {
    this.emit(EventsEnum.LOADING, {
      value: loading,
      detail,
    });
    this.emit(EventsEnum.ERROR, {
      value: error,
      detail,
    });
  };
}
