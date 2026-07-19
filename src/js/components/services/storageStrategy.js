const Memoria = {
    _cache: new Map(),
    
    has(key) {
        return this._cache.has(key);
    },
    get(key) {
        return this._cache.get(key);
    },
    set(key, value) {
        this._cache.set(key, value);
    }
};

const LocalStorage = {
    has(key) {
        return localStorage.getItem(key) !== null;
    },
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null; 
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export { Memoria, LocalStorage };