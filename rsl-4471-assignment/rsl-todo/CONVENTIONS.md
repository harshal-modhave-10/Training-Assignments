# rsl-todo — Engineering Conventions

These are enforced in review. Deviations need a written reason in the PR.

## Architecture

- **Services use constructor injection, never singletons.** No `static final INSTANCE`, no `getInstance()`.
- **Services never touch the web layer.** No `jakarta.servlet` imports, no rendering, no response writing. That is the controller's job.
- **Services talk to the network only through `RslHttpGateway`.** Do not use `java.net.http.HttpClient` directly — auth, query encoding, retries, status mapping and decoding are already handled in `RslHttpClient`.
- **Caching uses `RslCache`.** It is thread-safe and has TTL built in. Do not hand-roll `HashMap` caches.

## Errors

- Every service call returns `CompletableFuture<T>` that completes exceptionally with an `RslError`. **Returning `null` is not an error channel** — the caller must be able to tell *why* something failed.
- Never swallow an exception. Map it to an `RslError.Kind`.
- `catch (Exception e) { return null; }` is a review blocker.

## Security

- The API token comes from `RslSecrets.apiToken()`. It never appears in source, in checked-in config, or in logs.
- All user-supplied values in a URL go through the gateway's query map, which percent-encodes them. Never concatenate user input into a URI.

## Logging

- `System.out.println` and `System.err.println` are not permitted in committed code. Use `RslLogger`.
- Anything sensitive goes through `RslLogger.debug(message, redacting)`.

## Concurrency

- Shared mutable state is either confined to one thread or uses a concurrent collection. Plain `HashMap` across threads is a blocker.
- **Never block a `CompletableFuture` callback thread.** No `Thread.sleep` inside `whenComplete`, `thenApply`, or any async stage.
- Retry state is per-request, never a mutable instance field.

## Models

- Models are Jackson-annotated records. We use **Jackson only** — do not add a second JSON library.
- Snake-case mapping and `Instant` handling are configured centrally in `RslHttpClient`.

## Platform

- Java 17. Deprecated APIs must not be used.

## Tests

- Unit tests never touch the real network. Inject a stub gateway.
- Never use `Thread.sleep` to wait for an async result. Block on the future, or use a latch.
- Assert on real values, not just non-null.
- Failure paths are tested, not only the happy path.
