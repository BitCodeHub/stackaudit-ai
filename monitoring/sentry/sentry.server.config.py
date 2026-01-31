"""
Sentry Configuration for StackAudit.ai Backend (FastAPI)

Installation:
    pip install sentry-sdk[fastapi,celery,sqlalchemy]

Environment Variables Required:
    SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
    SENTRY_ENVIRONMENT=production|staging|development
"""

import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.httpx import HttpxIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import logging


def init_sentry():
    """Initialize Sentry for the FastAPI backend."""
    
    sentry_dsn = os.getenv("SENTRY_DSN")
    if not sentry_dsn:
        print("Warning: SENTRY_DSN not configured, skipping Sentry initialization")
        return
    
    environment = os.getenv("SENTRY_ENVIRONMENT", "development")
    release = os.getenv("APP_VERSION", "1.0.0")
    
    # Configure logging integration
    logging_integration = LoggingIntegration(
        level=logging.INFO,        # Capture info and above as breadcrumbs
        event_level=logging.ERROR  # Send errors and above as events
    )
    
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        release=f"stackaudit-backend@{release}",
        
        # Integrations
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
            CeleryIntegration(),
            SqlalchemyIntegration(),
            RedisIntegration(),
            HttpxIntegration(),
            logging_integration,
        ],
        
        # Performance Monitoring
        traces_sample_rate=0.1 if environment == "production" else 1.0,
        profiles_sample_rate=0.1 if environment == "production" else 1.0,
        
        # Error filtering
        before_send=before_send,
        before_send_transaction=before_send_transaction,
        
        # Additional options
        send_default_pii=False,  # Don't send PII by default
        attach_stacktrace=True,
        max_breadcrumbs=50,
        
        # Ignore specific errors
        ignore_errors=[
            KeyboardInterrupt,
            SystemExit,
        ],
    )


def before_send(event, hint):
    """Filter events before sending to Sentry."""
    
    # Get exception info if available
    exc_info = hint.get("exc_info")
    if exc_info:
        exc_type, exc_value, _ = exc_info
        
        # Ignore 404 errors
        from fastapi import HTTPException
        if isinstance(exc_value, HTTPException) and exc_value.status_code == 404:
            return None
        
        # Ignore authentication errors (expected)
        if isinstance(exc_value, HTTPException) and exc_value.status_code in [401, 403]:
            return None
        
        # Ignore validation errors (user input)
        from pydantic import ValidationError
        if isinstance(exc_value, ValidationError):
            return None
        
        # Ignore rate limit errors
        if isinstance(exc_value, HTTPException) and exc_value.status_code == 429:
            return None
    
    # Scrub sensitive data
    if "request" in event:
        # Remove authorization headers
        if "headers" in event["request"]:
            headers = event["request"]["headers"]
            for sensitive in ["authorization", "x-api-key", "cookie"]:
                if sensitive in headers:
                    headers[sensitive] = "[Filtered]"
    
    return event


def before_send_transaction(event, hint):
    """Filter transactions before sending."""
    
    transaction_name = event.get("transaction", "")
    
    # Skip health check endpoints
    if "/health" in transaction_name or "/ping" in transaction_name:
        return None
    
    # Skip metrics/internal endpoints
    if "/metrics" in transaction_name or "/_internal" in transaction_name:
        return None
    
    return event


# === Utility Functions ===

def capture_exception(error: Exception, **kwargs):
    """Capture an exception with additional context."""
    sentry_sdk.capture_exception(error, **kwargs)


def capture_message(message: str, level: str = "info", **kwargs):
    """Capture a message with additional context."""
    sentry_sdk.capture_message(message, level=level, **kwargs)


def set_user(user_id: str, username: str = None, email: str = None):
    """Set user context for error tracking."""
    sentry_sdk.set_user({
        "id": user_id,
        "username": username,
        "email": email,
    })


def clear_user():
    """Clear user context."""
    sentry_sdk.set_user(None)


def set_tag(key: str, value: str):
    """Set a tag for the current scope."""
    sentry_sdk.set_tag(key, value)


def set_context(name: str, data: dict):
    """Set additional context data."""
    sentry_sdk.set_context(name, data)


def add_breadcrumb(message: str, category: str = "custom", data: dict = None):
    """Add a breadcrumb for debugging."""
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        data=data or {},
        level="info",
    )


# === FastAPI Middleware ===

class SentryMiddleware:
    """Custom middleware to add request context to Sentry."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Add request ID to Sentry
            request_id = scope.get("headers", {}).get(b"x-request-id", b"").decode()
            if request_id:
                sentry_sdk.set_tag("request_id", request_id)
        
        await self.app(scope, receive, send)


# === Celery Task Decorator ===

def track_celery_task(func):
    """Decorator to track Celery task performance."""
    def wrapper(*args, **kwargs):
        with sentry_sdk.start_transaction(op="task", name=func.__name__):
            return func(*args, **kwargs)
    return wrapper
