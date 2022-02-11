import * as automerge from 'automerge';
import { DocSet } from './docset';
export * from './docset';


interface DocumentSlotInterface<D, T> {
    docSlot: DocumentSlot<D>;

    create(): T
    get(): T
    set(value: T): automerge.UUID
    change(action: (value: T) => void,
            post?: (newDoc: automerge.Doc<D>) => void): automerge.Doc<D>

    park(): Promise<T> & Cancelable

    path<F>(path: [string]): DocumentSlotInterface<D, F>
    object<F>(objectId: string | {}): DocumentSlotInterface<D, F>

    registerHandler(handler: (doc: T) => void): void
    unregisterHandler(handler: (doc: T) => void): void
}


type Cancelable = {
  cancel(): void;
}


type DocID = string

declare class SlotBase<D, T> {
    park(): Promise<T> & Cancelable
}

declare class DocumentSlot<D> extends SlotBase<D, automerge.Doc<D>> implements DocumentSlotInterface<D, automerge.Doc<D>> {
    docSlot: DocumentSlot<D>
    docSet: DocSet
    docId: DocID

    constructor(docSet: DocSet, docId: DocID)

    create(): automerge.Doc<D>
    get(): automerge.Doc<D>
    set(value: automerge.Doc<D>): automerge.UUID
    change(action: (value: automerge.Doc<D>) => void,
           post?: (newDoc: automerge.Doc<D>) => void): automerge.Doc<D>

    park(): Promise<automerge.Doc<D>> & Cancelable

    path<F>(path: [string]): DocumentSlotInterface<D, F>
    object<F>(objectId: string | {}): DocumentSlotInterface<D, F>

    registerHandler(handler: (doc: automerge.Doc<D>) => void): void
    unregisterHandler(handler: (doc: automerge.Doc<D>) => void): void
}
