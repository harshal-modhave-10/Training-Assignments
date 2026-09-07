package com.rsl.todo.core;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Every service talks to the network through this interface.
 * Services must not use java.net.http.HttpClient directly.
 */
public interface RslHttpGateway {

    /**
     * Issues a GET request.
     *
     * @param path  path relative to the API base, e.g. "todos/search"
     * @param query query parameters -- values are percent-encoded for you
     * @param type  the type to decode the response body into
     * @return a future that completes on the shared callback executor, or
     *         completes exceptionally with an {@link RslError}
     */
    <T> CompletableFuture<T> get(String path, Map<String, String> query, Class<T> type);
}
