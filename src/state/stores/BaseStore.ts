const DATABASE_NAME = "canvas";
const STORES = ["layers", "elements", "images"];
const VERSION = 2;

export default abstract class BaseStore {
	protected static storeName: string;
	private static db: Promise<IDBDatabase> | null = null;

	protected static open() {
		if (this.db) {
			return this.db;
		}

		this.db = new Promise((resolve, reject) => {
			const request = indexedDB.open(DATABASE_NAME, VERSION);

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onerror = () => {
				console.error(request.error);
				reject(request.error);
			};

			request.onupgradeneeded = () => {
				this.onUpgrade(request.result);
			};
		});

		return this.db;
	}

	protected static async close() {
		if (!this.db) {
			throw new Error("No DB to close.");
		}

		const db = await this.db;

		db.close();
	}

	private static onUpgrade(db: IDBDatabase) {
		for (const store of STORES) {
			if (!db.objectStoreNames.contains(store)) {
				db.createObjectStore(store, { keyPath: "id" });
			}
		}
	}

	protected static async getStore(mode: IDBTransactionMode = "readonly") {
		const db = await (this.db ?? this.open());

		return db.transaction(this.storeName, mode).objectStore(this.storeName);
	}

	protected static async get<T>(): Promise<[string, T][]>;
	protected static async get<T>(key: string): Promise<T | undefined>;
	protected static async get<T>(key?: string) {
		const store = await this.getStore();

		return new Promise((resolve, reject) => {
			if (key) {
				const req = store.get(key);

				req.onsuccess = () => resolve(req.result as T | undefined);
				req.onerror = () => reject(req.error);
			} else {
				const entries: [string, T][] = [];
				const cur = store.openCursor();

				cur.onsuccess = () => {
					const cursor = cur.result;

					if (cursor) {
						entries.push([cursor.key, cursor.value] as [string, T]);
						cursor.continue();
					} else {
						resolve(entries);
					}
				};

				cur.onerror = () => reject(cur.result);
			}
		});
	}

	protected static async add<T>(items: T[]) {
		const store = await this.getStore("readwrite");

		return new Promise<void>((resolve, reject) => {
			if (items.length === 0) {
				resolve();
			}

			for (const [idx, item] of items.entries()) {
				const req = store.put(item);

				req.onsuccess = () => {
					if (idx === items.length - 1) {
						resolve();
					}
				};

				req.onerror = () => reject(req.error);
			}
		});
	}

	protected static async remove(): Promise<void>;
	protected static async remove(keys: string[]): Promise<void>;
	protected static async remove(keys?: string[]): Promise<void> {
		const store = await this.getStore("readwrite");

		return new Promise<void>((resolve, reject) => {
			if (!keys) {
				const req = store.clear();

				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			} else {
				for (const [idx, key] of keys.entries()) {
					const req = store.delete(key);

					req.onsuccess = () => {
						if (idx === keys.length - 1) {
							resolve();
						}
					};

					req.onerror = () => reject(req.error);
				}
			}
		});
	}
}
