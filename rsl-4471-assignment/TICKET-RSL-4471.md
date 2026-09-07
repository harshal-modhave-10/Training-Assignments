# RSL-4471 — Search todos by keyword

**Type:** Feature · **Component:** rsl-todo / service · **Priority:** P2

## Description

Users need to search their todos by keyword from the search bar.

Add a `TodoSearchService` that queries the search endpoint and returns matching todos.

## Endpoint

```
GET /v1/todos/search?q={keyword}
```

Returns a `TodoPage` envelope:

```json
{
  "items": [
    {
      "id": "t_1",
      "title": "Buy milk",
      "notes": null,
      "is_completed": false,
      "due_date": "2026-08-04T09:00:00Z",
      "list_id": "l_1"
    }
  ],
  "total": 1,
  "next_cursor": null
}
```

## Requirements

1. Search todos for a given keyword.
2. **Cache results per query for 5 minutes.** After 5 minutes, the same query must go back to the network.
3. **The caller must be able to distinguish "no matching todos" from "the search failed."** An empty result and a failure are different outcomes and the UI shows different things for each.
4. Handle a blank or whitespace-only keyword without making a network call.
5. Include unit tests.

## Out of scope

- Web layer / rendering — the search endpoint controller is RSL-4488, a separate ticket
- Analytics
- Offline persistence
- Cache invalidation APIs
- Pagination (`next_cursor` is returned but unused for now)

## Notes

Follow the pattern in `TodoListService`. It does the same job for lists and is the reference implementation for services in this repo.
