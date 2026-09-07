package com.rsl.todo.core;

import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.util.List;

/**
 * Approved logging API. System.out.println is not permitted in committed code.
 * Values passed as {@code redacting} are masked before they reach the log stream.
 */
public final class RslLogger {

    private static final Logger LOG = System.getLogger("RSL");

    private RslLogger() {
    }

    public static void debug(String message, List<String> redacting) {
        String output = message;
        for (String secret : redacting) {
            if (secret != null && !secret.isEmpty()) {
                output = output.replace(secret, "***REDACTED***");
            }
        }
        LOG.log(Level.DEBUG, output);
    }

    public static void debug(String message) {
        debug(message, List.of());
    }

    public static void error(String message, Throwable cause) {
        LOG.log(Level.ERROR, message, cause);
    }
}
