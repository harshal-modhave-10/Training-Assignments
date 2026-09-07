# PR #812 — RSL-4471: Add todo search

**Author:** (AI-assisted) · **Reviewer:** you

## Files changed

| File | Status | Lines |
|---|---|---|
| `src/main/java/com/rsl/todo/service/TodoSearchService.java` | **new** | 159 |
| `src/test/java/com/rsl/todo/service/TodoSearchServiceTest.java` | **new** | 79 |
| `pom.xml` | modified | +14 |

Everything else in `rsl-todo/` is **existing code, not part of this PR**. Do not review it — read it as context.

## PR description as submitted by the author

> Adds TodoSearchService per RSL-4471. Searches todos by keyword and caches
> results for 5 minutes. Includes unit tests. All tests passing.

## pom.xml diff

```diff
+    <!-- Added by RSL-4471 -->
+    <dependency>
+      <groupId>com.google.code.gson</groupId>
+      <artifactId>gson</artifactId>
+      <version>2.11.0</version>
+    </dependency>
+
+    <!-- Added by RSL-4471 -->
+    <dependency>
+      <groupId>jakarta.servlet</groupId>
+      <artifactId>jakarta.servlet-api</artifactId>
+      <version>6.0.0</version>
+      <scope>provided</scope>
+    </dependency>
```

## Note

`com.rsl.todo.analytics.Analytics` and `com.rsl.todo.web.SearchResultsView` are imported by the new code but do not exist in this repo. That is a finding, not a setup error — treat it as part of the review.
