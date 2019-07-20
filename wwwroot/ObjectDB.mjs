
class AccessMode {
    static get ReadOnly() { return "readonly"; }
    static get ReadWrite() { return "readwrite"; }
}

export class OpenMode {
    static get OpenOnly() { return "open"; }
    static get CreateOnly() { return "create"; }
    static get CreateOpen() { return "openCreate"; }
}

const dbName = Symbol("Database Name");
const dbVersion = Symbol("Database Version");
const dsName = Symbol("DataSet Name");
const openMode = Symbol("Database Open Mode");
const typeMap = Symbol("TypeMap");
const dsType = "types";

export { ObjectDB };
export default class ObjectDB {
    type = import.meta.url;
    static type = import.meta.url;

    [typeMap] = new Map();

    [dbName] = "tempDb";
    [dbVersion] = 1;
    [dsName] = "tempDs";
    [openMode];

    constructor({ database, dataset, version, mode = OpenMode.CreateOnly } = {}) {
        if (database) this[dbName] = database;
        if (dataset) this[dsName] = dataset;
        if (version) this[dbVersion] = version;
        if (mode) this[openMode] = mode;
    }

    openDbAsync = (db = this[dbName], ds = this[dsName], v = this[dbVersion]) => {
        return new Promise((resolve, reject) => {

            const dbRequest = indexedDB.open(db, v);

            dbRequest.onerror = () => reject(dbRequest.error);
            dbRequest.onsuccess = () => resolve(dbRequest.result);

            dbRequest.onupgradeneeded = () => {
                dbRequest.result.createObjectStore(ds);
            };
        });
    };

    executeTxnAsync = ({ db = this[dbName], ds = this[dsName], accessMode, query } = {}) => {
        return new Promise(async (resolve, reject) => {

            const transaction = db.transaction(ds, accessMode);
            const dataStore = transaction.objectStore(ds);

            transaction.oncomplete = () => resolve();
            transaction.onabort = transaction.onerror = () => reject(transaction.error);

            query(dataStore);
        });
    }

    async readAsync(key) {
        try {
            let out_Buffer;
            const db = await this.openDbAsync();
            await this.executeTxnAsync({
                db: db,
                accessMode: AccessMode.ReadOnly,
                query: s => { out_Buffer = s.get(key); }
            });
            if (out_Buffer.result) {
                const anon = JSON.parse(out_Buffer.result);
                const spec = this[typeMap].get(anon.meta.type);
                const result = Object.assign(Reflect.construct(spec, []), anon);
                return result;
            } else {
                return null;
            }
        } catch (ex) {
            return undefined;
        }
    }

    async writeAsync(key, value) {
        const type = value.meta.type;
        const spec = (await import(value.meta.type)).default;
        if (!this[typeMap].has(type)) {
            this[typeMap].set(type, spec);
        }

        try {
            const db = await this.openDbAsync();
            const txn = await this.executeTxnAsync({
                db: db,
                accessMode: AccessMode.ReadWrite,
                query: s => { s.put(JSON.stringify(value), key); }
            });
            txn.put(value, key);
            return true;
        } catch (ex) {
            return false;
        }
    }
}