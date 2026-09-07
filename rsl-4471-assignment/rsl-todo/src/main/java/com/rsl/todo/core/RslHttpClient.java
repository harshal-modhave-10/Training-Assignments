package com.rsl.todo.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

/**
 * The single HTTP entry point for all RSL services.
 *
 * Handles: base URL construction, query encoding, auth header injection from
 * RslSecrets, HTTP status mapping to RslError, JSON decoding, and retry with
 * exponential backoff for retryable failures.
 *
 * All futures complete on the shared callback executor. Services rely on this.
 */
public final class RslHttpClient implements RslHttpGateway {

    private static final URI BASE_URI = URI.create("https://api.rsl-internal.com/v1");
    private static final int MAX_RETRIES = 3;

    private final HttpClient http;
    private final ObjectMapper mapper;
    private final Executor callbackExecutor;

    public RslHttpClient(HttpClient http, Executor callbackExecutor) {
        this.http = http;
        this.callbackExecutor = callbackExecutor;
        this.mapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Override
    public <T> CompletableFuture<T> get(String path, Map<String, String> query, Class<T> type) {
        String token = RslSecrets.apiToken();
        if (token == null) {
            return CompletableFuture.failedFuture(
                    new RslError(RslError.Kind.UNAUTHORIZED, "No API token configured"));
        }

        URI uri = URI.create(BASE_URI + "/" + path + encodeQuery(query));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();

        RslLogger.debug("GET " + uri, java.util.List.of(token));

        return perform(request, type, 0);
    }

    private String encodeQuery(Map<String, String> query) {
        if (query == null || query.isEmpty()) {
            return "";
        }
        return "?" + query.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8)
                        + "="
                        + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private <T> CompletableFuture<T> perform(HttpRequest request, Class<T> type, int attempt) {
        return http.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenComposeAsync(response -> handle(request, response, type, attempt), callbackExecutor)
                .exceptionallyCompose(throwable -> {
                    if (throwable.getCause() instanceof RslError err) {
                        return retryOrFail(request, type, attempt, err);
                    }
                    return retryOrFail(request, type, attempt,
                            new RslError(RslError.Kind.NETWORK, throwable.getMessage()));
                });
    }

    private <T> CompletableFuture<T> handle(HttpRequest request,
                                            HttpResponse<String> response,
                                            Class<T> type,
                                            int attempt) {
        int status = response.statusCode();

        if (status == 401 || status == 403) {
            return CompletableFuture.failedFuture(
                    new RslError(RslError.Kind.UNAUTHORIZED, "HTTP " + status));
        }
        if (status == 404) {
            return CompletableFuture.failedFuture(
                    new RslError(RslError.Kind.NOT_FOUND, "HTTP 404"));
        }
        if (status == 429) {
            double retryAfter = response.headers().firstValue("Retry-After")
                    .map(Double::parseDouble).orElse(2.0);
            return retryOrFail(request, type, attempt,
                    new RslError(RslError.Kind.RATE_LIMITED, "HTTP 429", retryAfter));
        }
        if (status < 200 || status > 299) {
            return retryOrFail(request, type, attempt,
                    new RslError(RslError.Kind.NETWORK, "HTTP " + status));
        }

        try {
            return CompletableFuture.completedFuture(mapper.readValue(response.body(), type));
        } catch (Exception e) {
            return CompletableFuture.failedFuture(
                    new RslError(RslError.Kind.DECODING, e.getMessage()));
        }
    }

    private <T> CompletableFuture<T> retryOrFail(HttpRequest request, Class<T> type,
                                                 int attempt, RslError error) {
        if (!error.isRetryable() || attempt >= MAX_RETRIES) {
            return CompletableFuture.failedFuture(error);
        }
        CompletableFuture<T> delayed = new CompletableFuture<>();
        long delayMillis = (long) (Math.pow(2, attempt) * 1000);
        CompletableFuture.delayedExecutor(delayMillis, java.util.concurrent.TimeUnit.MILLISECONDS)
                .execute(() -> perform(request, type, attempt + 1)
                        .whenComplete((value, err) -> {
                            if (err != null) {
                                delayed.completeExceptionally(err);
                            } else {
                                delayed.complete(value);
                            }
                        }));
        return delayed;
    }
}
