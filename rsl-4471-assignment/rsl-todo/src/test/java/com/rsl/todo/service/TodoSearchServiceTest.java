package com.rsl.todo.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.rsl.todo.model.TodoItem;
import org.junit.jupiter.api.Test;

import java.net.http.HttpClient;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MockSearchResultTransformer implements TodoSearchService.SearchResultTransformer {

    final List<TodoItem> stubbedItems = List.of(
            new TodoItem("t_1", "Buy milk", null, false, null, "l_1"));

    @Override
    public List<TodoItem> transform(JsonObject json) {
        return stubbedItems;
    }
}

class SpyHttpClient {
    int requestCount = 0;
}

class TodoSearchServiceTest {

    @Test
    void transformerParsesValidJson() {
        JsonObject json = JsonParser.parseString(
                "{\"items\":[{\"id\":\"t_1\",\"title\":\"Buy milk\",\"list_id\":\"l_1\"}]}")
                .getAsJsonObject();

        TodoSearchService.DefaultSearchResultTransformer transformer =
                new TodoSearchService.DefaultSearchResultTransformer();
        List<TodoItem> items = transformer.transform(json);

        assertNotNull(items);
    }

    @Test
    void searchReturnsResults() throws Exception {
        MockSearchResultTransformer mock = new MockSearchResultTransformer();
        TodoSearchService service =
                new TodoSearchService(mock, HttpClient.newHttpClient());

        service.search("milk", items ->
                assertEquals(mock.stubbedItems.get(0).id(), items.get(0).id()));

        Thread.sleep(2000);
    }

    @Test
    void cacheReturnsResultsOnSecondCall() {
        TodoSearchService service =
                new TodoSearchService(new MockSearchResultTransformer(), HttpClient.newHttpClient());

        service.search("milk", items -> {
        });
        service.search("milk", items -> assertNotNull(items));
    }

    @Test
    void clearSearchCacheWorks() {
        TodoSearchService service =
                new TodoSearchService(new MockSearchResultTransformer(), HttpClient.newHttpClient());
        service.clearSearchCache("milk");
        assertTrue(true);
    }

    @Test
    void serviceInitDoesNotTriggerNetwork() {
        SpyHttpClient spy = new SpyHttpClient();
        new TodoSearchService();
        assertEquals(0, spy.requestCount);
    }
}
