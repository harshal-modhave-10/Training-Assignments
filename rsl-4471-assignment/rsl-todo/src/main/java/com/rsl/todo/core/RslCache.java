package com.rsl.todo.core;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe in-memory cache with time-to-live.
 * Used by TodoListService and two other services. Prefer this over hand-rolled
 * maps -- TTL and thread safety are already handled here.
 */
public final class RslCache<K, V> {

    private record Entry<V>(V value, Instant storedAt) {
    }

    private final Map<K, Entry<V>> storage = new ConcurrentHashMap<>();
    private final Duration ttl;

    public RslCache(Duration ttl) {
        this.ttl = ttl;
    }

    /**
     * Returns the cached value only if it is still within its TTL.
     * Expired entries are dropped on read.
     */
    public V get(K key) {
        Entry<V> entry = storage.get(key);
        if (entry == null) {
            return null;
        }
        if (Duration.between(entry.storedAt(), Instant.now()).compareTo(ttl) >= 0) {
            storage.remove(key);
            return null;
        }
        return entry.value();
    }

    public void put(K key, V value) {
        storage.put(key, new Entry<>(value, Instant.now()));
    }

    public void clear() {
        storage.clear();
    }
}
