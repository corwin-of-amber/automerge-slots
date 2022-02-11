import { EventEmitter  } from 'events';
import Automerge from 'automerge';


/**
 * Polyfills `DocSet`, which is no longer part of Automerge 1.x.
 * (still useful for grouping a bunch of documents and defining slots over them.)
 */
class DocSet<D = any> extends EventEmitter {
    docs = new Map<string, DocWithObservable<D>>()

    syncStates = new Map<string, Automerge.SyncState>()

    createDoc(docId: string) {
        return this._createDoc(docId).doc;
    }

    getDoc(docId: string) {
        return this.docs.get(docId)?.doc;
    }

    setDoc(docId: string, d: Automerge.Doc<D>) {
        var ed = this.docs.get(docId);
        if (ed) ed.doc = d;
        else throw new Error("cannot set doc without observable");  // @todo allow non-observed docs as well?
        this.emit('change', docId, d);
    }

    _createDoc(docId: string) {
        var newDoc = this._mkDoc();
        this.docs.set(docId, newDoc);
        this.emit('change', docId, newDoc.doc);
        return newDoc;
    }

    _mkDoc() { return new DocWithObservable<D>(); }

    observe<O>(docId: string, object: O, callback: Automerge.ObserverCallback<O>) {
        var entry = this.docs.get(docId);
        entry.observable.observe(object, callback);
    }

    registerHandler(handler: (docId: string, doc: Automerge.FreezeObject<D>) => void) {
        this.on('change', handler);
        /**
         * @todo consider switching to using Observable in the long run.
         * This is kept here as reference. 
        var hooks = handler[DocSet.HOOK] = [],
            hookup = <T>(t: T) => { hooks.push(t); return t; },
            stillOn = () => handler[DocSet.HOOK] === hooks;
        for (let [docId, entry] of this.docs.entries()) {
            entry.observable.observe(entry.doc,
                hookup((diff, oldRev, newRev) => 
                    stillOn() && handler(docId, newRev)))
        }
        */
    }

    unregisterHandler(handler: (docId: string, doc: Automerge.FreezeObject<D>) => void) {
        this.off('change', handler);
        /** @oops no way to unobserve in automerge? */
        // for (let hook of handler[DocSet.HOOK] ?? []) { ... }
        //delete handler[DocSet.HOOK];
    }

    //static HOOK = Symbol('DocSet.HOOK')
}

class DocWithObservable<D> {
    doc: Automerge.Doc<D>
    observable = new Automerge.Observable()

    constructor() {
        this.doc = Automerge.init<D>({observable: this.observable});
    }
}


export { DocSet, DocWithObservable }