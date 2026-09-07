package com.rsl.todo.core;

/**
 * The only approved source of the API token.
 * Tokens must never appear in source, config files checked into git, or logs.
 */
public final class RslSecrets {

    private static final String TOKEN_ENV = "RSL_API_TOKEN";

    private RslSecrets() {
    }

    /**
     * @return the API token, or null if the environment is not configured.
     */
    public static String apiToken() {
        String token = System.getenv(TOKEN_ENV);
        if (token == null || token.isBlank()) {
            return null;
        }
        return token;
    }
}
