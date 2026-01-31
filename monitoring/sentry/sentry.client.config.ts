/**
 * Sentry Configuration for StackAudit.ai Frontend (React)
 * 
 * Installation:
 *   npm install @sentry/react @sentry/tracing
 * 
 * Environment Variables Required:
 *   VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
 *   VITE_SENTRY_ENVIRONMENT=production|staging|development
 */

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Initialize Sentry
export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn("Sentry DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "development",
    release: `stackaudit-frontend@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,

    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Trace all outgoing requests to the API
        tracePropagationTargets: [
          "localhost",
          "api.stackaudit.ai",
          /^\//,
        ],
        // Route change tracking for React Router
        routingInstrumentation: Sentry.reactRouterV6Instrumentation,
      }),
      // Replay for session recording (free tier: 50 sessions/month)
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Sample rates (adjust for production traffic)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% on errors

    // Filter out non-essential errors
    beforeSend(event, hint) {
      // Ignore network errors from extensions
      if (event.exception?.values?.[0]?.type === "ChunkLoadError") {
        return null;
      }
      
      // Ignore canceled requests
      if (event.message?.includes("AbortError")) {
        return null;
      }

      // Add user context if available
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          Sentry.setUser({
            id: userData.id,
            username: userData.username,
          });
        } catch {
          // Ignore JSON parse errors
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      // Network issues
      "Network Error",
      "Failed to fetch",
      "Load failed",
      // User aborts
      "AbortError",
      "The user aborted a request",
    ],

    // Filter transactions
    beforeSendTransaction(event) {
      // Don't send health check transactions
      if (event.transaction?.includes("/health")) {
        return null;
      }
      return event;
    },
  });
}

// Error Boundary Component
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Profiler for component performance
export const SentryProfiler = Sentry.withProfiler;

// Manual error capture
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Manual message capture
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

// Set user context
export function setUser(user: { id: string; username: string; email?: string }) {
  Sentry.setUser(user);
}

// Clear user on logout
export function clearUser() {
  Sentry.setUser(null);
}

// Add breadcrumb for debugging
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}
