import { EventEmitter } from "node:events";
import type { PackageEventMap, PackageEventName } from "./types";

class PackageEventBus {
  private emitter = new EventEmitter();

  emit<E extends PackageEventName>(event: E, payload: PackageEventMap[E]) {
    this.emitter.emit(event, payload);
  }

  on<E extends PackageEventName>(
    event: E,
    handler: (payload: PackageEventMap[E]) => void,
  ) {
    this.emitter.on(event, handler);
  }
}

const globalForEventBus = globalThis as unknown as { eventBus?: PackageEventBus };
export const eventBus = globalForEventBus.eventBus ?? new PackageEventBus();
globalForEventBus.eventBus = eventBus;
