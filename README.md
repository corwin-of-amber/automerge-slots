# automerge-slots

A thin layer for accessing Automerge elements through a unified interface.

Classes:
 * `DocumentSlot` - represents a document within an Automerge `DocSet`.
 * `DocumentPathSlot` - represents a value in a document via a path. E.g., `doc.members[0].name`
   is represented by the path `['members', 0, 'name']`.
 * `DocumentObjectSlot` - represents an object in a document via its object identifier (obtained
   through `Automerge.getObjectId`.

