package com.rsl.todo.core;

/**
 * The single error type returned by every RSL service.
 * Callers switch on {@link Kind} to decide what to show the user.
 */
public class RslError extends RuntimeException {

    public enum Kind {
        NOT_FOUND,
        UNAUTHORIZED,
        RATE_LIMITED,
        NETWORK,
        DECODING,
        INVALID_REQUEST
    }

    private final Kind kind;
    private final double retryAfterSeconds;

    public RslError(Kind kind, String message) {
        this(kind, message, 0);
    }

    public RslError(Kind kind, String message, double retryAfterSeconds) {
        super(message);
        this.kind = kind;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public Kind kind() {
        return kind;
    }

    public double retryAfterSeconds() {
        return retryAfterSeconds;
    }

    public boolean isRetryable() {
        return kind == Kind.NETWORK || kind == Kind.RATE_LIMITED;
    }
}
