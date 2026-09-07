package com.rsl.todo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** Envelope returned by the list and search endpoints. */
public record TodoPage(
        @JsonProperty("items") List<TodoItem> items,
        @JsonProperty("total") int total,
        @JsonProperty("next_cursor") String nextCursor) {
}
