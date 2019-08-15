import * as automerge from 'automerge';



type DocumentSlotInterface<D, T> = {
  docSlot: DocumentSlotInterface<D, automerge.Doc<D>>;

  create(): T;
  get(): T;
  set(value: T): automerge.UUID;
  change(action: (value: T) => void,
         post?: (newDoc: automerge.Doc<D>) => void): automerge.Doc<D>;

  park(): Promise<T> & Cancelable;

  registerHandler(handler: (doc: T) => void): void;
  unregisterHandler(handler: (doc: T) => void): void;
}


type Cancelable = {
  cancel(): void;
}
