import { EventsEnum, EventsEnumType, IEvents, Listener, PlayersEnum } from "./types";

export class Events {
  private readonly _events: IEvents;

  constructor() {
    this._events = {};
  }

  on = (event: EventsEnumType, fn: Listener) => {
    if (typeof this._events[event] !== "object") this._events[event] = [];
    this._events[event].push(fn);
    return () => this.removeListener(event, fn);
  };

  emit = (
    event: EventsEnumType,
    ...args: {
      event: EventsEnumType;
      value: boolean | number | string | Array<any>;
      detail?: any;
    }[]
  ) => {
    if (typeof this._events[event] !== "object") return;
    [...this._events[event]].forEach((listener) => listener.apply(this, args));
  };

  removeListener = (event: EventsEnumType, listener: Listener) => {
    if (typeof this._events[event] !== "object") return;
    const idx: number = this._events[event].indexOf(listener);
    if (idx > -1) {
      this._events[event].splice(idx, 1);
    }
  };

  removeAllListeners = () => {
    Object.keys(this._events).forEach((event: string) =>
      this._events[event].splice(0, this._events[event].length)
    );
  };

  fatalErrorRetry = (d: any) => console.log(d);

  loadingErrorEvents = (loading: boolean, error: boolean, detail?: any) => {
    this.emit(EventsEnum.LOADING, {
      event: EventsEnum.LOADING,
      value: loading,
      detail,
    });
    this.emit(EventsEnum.ERROR, {
      event: EventsEnum.ERROR,
      value: error,
      detail,
    });
  };
}
