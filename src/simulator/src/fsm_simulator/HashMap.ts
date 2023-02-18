export interface Hashable {
	identityString(): string;
}

export class HashMap<K extends Hashable, V> {
	protected identityKeyMap: Map<string, K>;
	protected identityValueMap: Map<string, V>;

	constructor(items: [K, V][] = []) {
		this.identityKeyMap = new Map();
		this.identityValueMap = new Map();

		for (let [key, value] of items) this.set(key, value);
	}

	get(key: K): V | undefined {
		return this.identityValueMap.get(key.identityString());
	}

	set(key: K, value: V): HashMap<K, V> {
		let identity = key.identityString();
		this.identityKeyMap.set(identity, key);
		this.identityValueMap.set(identity, value);
		return this;
	}

    has(key: K): boolean{
        return this.identityKeyMap.has(key.identityString());
    }

    *keys(): Iterator<K>{
        return this.identityKeyMap.values();
    }

    *values(): Iterator<V>{
        return this.identityValueMap.values();
    }

	*[Symbol.iterator](): Iterator<[K, V]> {
		for (let [identity, key] of this.identityKeyMap)
			yield [key, this.identityValueMap.get(identity)!];
	}
}

export default HashMap;
