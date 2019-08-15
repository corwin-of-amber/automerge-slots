
/**
 * Base class with common / default implementations.
 */
class SlotBase {
    park() {
        var receiver = this.docSlot || this, h;

        var promise = new Promise((resolve, reject) => {
            h = () => {
                var value = this.get();
                if (value)
                    { promise.cancel(); resolve(value); }
            }
            receiver.registerHandler(h);
        });
        promise.cancel = () => receiver.unregisterHandler(h);
        h();
        return promise;
    }
}

/**
 * Represents a document within its DocSet.
 */
class DocumentSlot extends SlotBase {
    constructor(docSet, docId) {
        super();
        this.docSet = docSet;
        this.docId = docId;
    }

    get() {
        return this.docSet.getDoc(this.docId);
    }

    getFrom(doc) { return doc; }

    set(doc) {
        this.docSet.setDoc(this.docId, doc);
    }

    change(func, post=undefined) {
        var doc = this.get() || automerge.init(),
            newDoc = automerge.change(doc, func);
        if (post) post(newDoc);
        // only set if changed, to avoid triggering an event
        if (newDoc !== doc)
            this.set(newDoc);
        return newDoc;
    }

    create() {
        var doc = automerge.init();
        this.set(doc);
        return doc;
    }

    path(path=[]) {
        return (path && path.length) ? new DocumentPathSlot(this, path) : this;
    }

    object(objectId) {
        return new DocumentObjectSlot(this, objectId);
    }

    registerHandler(callback) {
        var h;
        this.docSet.registerHandler(h = (docId, doc) => {
            if (docId === this.docId) callback(doc);
        });
        callback._sloth = h; // for unregister
    }

    unregisterHandler(callback) {
        if (callback._sloth)
            this.docSet.unregisterHandler(callback._sloth);
    }
}

/**
 * Represents an object contained in a document,
 * referenced by its path.
 */
class DocumentPathSlot extends SlotBase {
    constructor(docSlot, path=[]) {
        super();
        this.docSlot = docSlot;
        this.path = path;
    }
    
    get() {
        return this.getFrom(this.docSlot.get());
    }

    getFrom(doc) {
        return this._getPath(doc, this.path);
    }

    set(value) {
        var newValue;
        this.docSlot.change(doc => {
            var parent = this._getPath(doc, this.path.slice(0, -1)),
                prop = this.path.slice(-1)[0];
            if (typeof value === 'function')
                value = value(parent[prop]);
            if (value instanceof Promise) return;
            parent[prop] = value;
            newValue = parent[prop];
        });
        if (value instanceof Promise)  // async update
            return value.then(value => this.set(value));
        else
            return automerge.getObjectId(newValue);
    }

    change(func, post=undefined) {
        return this.docSlot.change(doc => func(this.getFrom(doc)), post);
    }

    path(path=[]) {
        return path && path.length ?
            this.docSlot.path(this.path.concat(path)) : this;
    }

    object(objectId) {
        // (does not check that objectId is actually in a sub-path)
        return this.docSlot.object(objectId);
    }

    _getPath(obj, path) {
        for (let prop of path) {
            if (obj === undefined) break;
            obj = obj[prop];
        }
        return obj;
    }
}

/**
 * Represents an object contained in a document,
 * referenced via its object identifier.
 */
class DocumentObjectSlot extends SlotBase {
    constructor(docSlot, objectId) {
        super();
        this.docSlot = docSlot;
        this.objectId = objectId;
    }

    get() {
        return this.getFrom(this.docSlot.get());
    }

    getFrom(doc) {
        return automerge.getObjectById(doc, this.objectId);
    }

    set(value) {
        throw new Error('cannot set object by identifier only');
    }

    change(func, post=undefined) {
        return this.docSlot.change(doc => func(this.getFrom(doc)), post);
    }

    path(path=[]) {
        throw new Error('not implemented');
    }

    object(objectId) {
        // (does not check that objectId is actually a sub-object)
        return this.docSlot.object(objectId);
    }
}



module.exports = {DocumentSlot, DocumentPathSlot, DocumentObjectSlot};
