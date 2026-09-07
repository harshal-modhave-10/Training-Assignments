package com.rsl.todo.service;

import com.rsl.todo.core.RslCache;
import com.rsl.todo.core.RslError;
import com.rsl.todo.core.RslHttpGateway;
import com.rsl.todo.model.TodoItem;
import com.rsl.todo.model.TodoPage;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Reference test style. Note: a stub gateway (never the real network),
 * assertions on real values rather than non-null, and coverage of the failure
 * cases as well as the happy path.
 */
class StubGateway implements RslHttpGateway {

    CompletableFuture<Object> result =
            CompletableFuture.completedFuture(new TodoPage(List.of(), 0, null));
    int callCount = 0;
    String lastPath;
    Map<String, String> lastQuery;

    @Override
    @SuppressWarnings("unchecked")
    public <T> CompletableFuture<T> get(String path, Map<String, String> query, Class<T> type) {
        callCount++;
        lastPath = path;
        lastQuery = query;
        return (CompletableFuture<T>) result;
    }
}

class TodoListServiceTest {

    private TodoItem item() {
        return new TodoItem("t_1", "Buy milk", null, false, null, "l_1");
    }

    @Test
    void returnsItemsFromNetwork() throws Exception {
        StubGateway gateway = new StubGateway();
        gateway.result = CompletableFuture.completedFuture(
                new TodoPage(List.of(item()), 1, null));
        TodoListService service = new TodoListService(gateway);

        TodoPage page = service.todos("l_1").get();

        assertEquals(1, page.items().size());
        assertEquals("Buy milk", page.items().get(0).title());
        assertEquals(1, page.total());
        assertEquals("lists/l_1/todos", gateway.lastPath);
    }

    @Test
    void secondCallIsServedFromCacheWithoutHittingNetwork() throws Exception {
        StubGateway gateway = new StubGateway();
        gateway.result = CompletableFuture.completedFuture(
                new TodoPage(List.of(item()), 1, null));
        TodoListService service = new TodoListService(gateway);

        service.todos("l_1").get();
        service.todos("l_1").get();

        assertEquals(1, gateway.callCount, "second call should not hit the network");
    }

    @Test
    void expiredCacheRefetches() throws Exception {
        StubGateway gateway = new StubGateway();
        gateway.result = CompletableFuture.completedFuture(
                new TodoPage(List.of(item()), 1, null));
        TodoListService service =
                new TodoListService(gateway, new RslCache<>(Duration.ofMillis(50)));

        service.todos("l_1").get();
        Thread.sleep(100);
        service.todos("l_1").get();

        assertEquals(2, gateway.callCount, "expired cache should refetch");
    }

    @Test
    void notFoundIsSurfacedToCaller() {
        StubGateway gateway = new StubGateway();
        gateway.result = CompletableFuture.failedFuture(
                new RslError(RslError.Kind.NOT_FOUND, "HTTP 404"));
        TodoListService service = new TodoListService(gateway);

        ExecutionException thrown = assertThrows(ExecutionException.class,
                () -> service.todos("missing").get());

        RslError error = (RslError) thrown.getCause();
        assertEquals(RslError.Kind.NOT_FOUND, error.kind());
    }

    @Test
    void blankListIdIsRejectedWithoutNetworkCall() {
        StubGateway gateway = new StubGateway();
        TodoListService service = new TodoListService(gateway);

        ExecutionException thrown = assertThrows(ExecutionException.class,
                () -> service.todos("  ").get());

        RslError error = (RslError) thrown.getCause();
        assertEquals(RslError.Kind.INVALID_REQUEST, error.kind());
        assertEquals(0, gateway.callCount);
    }
}
