import * as automerge from 'automerge';



type DocumentSlotInterface<D, T> = {
  docSlot: DocumentSlotInterface<D, automerge.Doc<D>>;

  create(): T;
  get(): T;
  set(value: T): automerge.UUID;
  change(action: (value: T) => void): automerge.Doc<D>;

  registerHandler(handler: (doc: T) => void): void;
  unregisterHandler(handler: (doc: T) => void): void;
}
