package com.rsl.todo.service;

import com.rsl.todo.core.RslCache;
import com.rsl.todo.core.RslError;
import com.rsl.todo.core.RslHttpGateway;
import com.rsl.todo.model.TodoPage;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Fetches todo lists. This is the house pattern every service follows:
 * constructor injection, RslCache for TTL, CompletableFuture that completes
 * exceptionally with RslError, no presentation concerns, no singletons.
 */
public final class TodoListService {

    private final RslHttpGateway gateway;
    private final RslCache<String, TodoPage> cache;

    public TodoListService(RslHttpGateway gateway) {
        this(gateway, new RslCache<>(Duration.ofMinutes(5)));
    }

    public TodoListService(RslHttpGateway gateway, RslCache<String, TodoPage> cache) {
        this.gateway = gateway;
        this.cache = cache;
    }

    /**
     * Returns the todos in a list, cached for 5 minutes.
     * A cache hit still returns a future so callers get one consistent contract.
     */
    public CompletableFuture<TodoPage> todos(String listId) {
        if (listId == null || listId.isBlank()) {
            return CompletableFuture.failedFuture(
                    new RslError(RslError.Kind.INVALID_REQUEST, "listId is blank"));
        }

        TodoPage cached = cache.get(listId);
        if (cached != null) {
            return CompletableFuture.completedFuture(cached);
        }

        return gateway.get("lists/" + listId + "/todos", Map.of(), TodoPage.class)
                .thenApply(page -> {
                    cache.put(listId, page);
                    return page;
                });
    }

    public void invalidateCache() {
        cache.clear();
    }
}
