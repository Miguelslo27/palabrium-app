// Simple client-side pub/sub for chapter progress
// This module is safe to import from server code; only browser consumers will use it.

type ProgressPayload = { index: number; total: number };

const channelName = 'chapter-progress-channel';

export const chapterProgress = {
  _et: null as EventTarget | null,
  get et() {
    if (!this._et) this._et = new EventTarget();
    return this._et as EventTarget;
  },
  publish(payload: ProgressPayload) {
    const ev = new CustomEvent(channelName, { detail: payload });
    this.et.dispatchEvent(ev);
  },
  subscribe(fn: (p: ProgressPayload) => void) {
    const handler = (e: Event) => fn((e as CustomEvent).detail as ProgressPayload);
    this.et.addEventListener(channelName, handler as EventListener);
    return () => this.et.removeEventListener(channelName, handler as EventListener);
  },
};
