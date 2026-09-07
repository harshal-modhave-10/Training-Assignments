package com.rsl.todo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record TodoItem(
        @JsonProperty("id") String id,
        @JsonProperty("title") String title,
        @JsonProperty("notes") String notes,
        @JsonProperty("is_completed") boolean isCompleted,
        @JsonProperty("due_date") Instant dueDate,
        @JsonProperty("list_id") String listId) {
}
