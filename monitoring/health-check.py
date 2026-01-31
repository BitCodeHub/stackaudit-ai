"""
Health Check Endpoint Implementation for StackAudit.ai

Add this to your FastAPI application for comprehensive health monitoring.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import asyncio
import os

router = APIRouter()


class HealthStatus(BaseModel):
    status: str  # healthy, degraded, unhealthy
    version: str
    environment: str
    timestamp: str
    uptime_seconds: float
    checks: Dict[str, Any]


class ComponentHealth(BaseModel):
    status: str
    latency_ms: Optional[float] = None
    message: Optional[str] = None


# Track start time for uptime calculation
START_TIME = datetime.utcnow()


async def check_database() -> ComponentHealth:
    """Check database connectivity."""
    try:
        import time
        start = time.time()
        
        # Replace with your actual database check
        from sqlalchemy import text
        from database import get_db
        
        async with get_db() as db:
            await db.execute(text("SELECT 1"))
        
        latency = (time.time() - start) * 1000
        return ComponentHealth(status="healthy", latency_ms=round(latency, 2))
    except Exception as e:
        return ComponentHealth(status="unhealthy", message=str(e))


async def check_redis() -> ComponentHealth:
    """Check Redis connectivity."""
    try:
        import time
        start = time.time()
        
        # Replace with your actual Redis client
        from redis_client import redis
        
        await redis.ping()
        
        latency = (time.time() - start) * 1000
        return ComponentHealth(status="healthy", latency_ms=round(latency, 2))
    except Exception as e:
        return ComponentHealth(status="unhealthy", message=str(e))


async def check_github_api() -> ComponentHealth:
    """Check GitHub API availability."""
    try:
        import time
        import httpx
        
        start = time.time()
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/status",
                timeout=5.0
            )
        
        latency = (time.time() - start) * 1000
        
        if response.status_code == 200:
            return ComponentHealth(status="healthy", latency_ms=round(latency, 2))
        else:
            return ComponentHealth(
                status="degraded",
                latency_ms=round(latency, 2),
                message=f"Status code: {response.status_code}"
            )
    except Exception as e:
        return ComponentHealth(status="unhealthy", message=str(e))


async def check_celery_workers() -> ComponentHealth:
    """Check Celery worker availability."""
    try:
        from celery_app import celery
        
        # Inspect active workers
        inspect = celery.control.inspect()
        active = inspect.active()
        
        if active:
            worker_count = len(active)
            return ComponentHealth(
                status="healthy",
                message=f"{worker_count} workers active"
            )
        else:
            return ComponentHealth(
                status="degraded",
                message="No active workers found"
            )
    except Exception as e:
        return ComponentHealth(status="unhealthy", message=str(e))


@router.get("/api/health", response_model=HealthStatus)
async def health_check():
    """
    Comprehensive health check endpoint.
    
    Returns:
        - status: healthy/degraded/unhealthy
        - version: Application version
        - environment: Production/staging/development
        - timestamp: Current UTC time
        - uptime_seconds: Time since last restart
        - checks: Individual component health
    """
    # Run all checks concurrently
    db_check, redis_check, github_check = await asyncio.gather(
        check_database(),
        check_redis(),
        check_github_api(),
        return_exceptions=True
    )
    
    # Convert exceptions to unhealthy status
    if isinstance(db_check, Exception):
        db_check = ComponentHealth(status="unhealthy", message=str(db_check))
    if isinstance(redis_check, Exception):
        redis_check = ComponentHealth(status="unhealthy", message=str(redis_check))
    if isinstance(github_check, Exception):
        github_check = ComponentHealth(status="unhealthy", message=str(github_check))
    
    checks = {
        "database": db_check.dict(),
        "redis": redis_check.dict(),
        "github_api": github_check.dict(),
    }
    
    # Determine overall status
    statuses = [db_check.status, redis_check.status]  # Core services
    
    if any(s == "unhealthy" for s in statuses):
        overall_status = "unhealthy"
    elif any(s == "degraded" for s in statuses):
        overall_status = "degraded"
    else:
        overall_status = "healthy"
    
    uptime = (datetime.utcnow() - START_TIME).total_seconds()
    
    health = HealthStatus(
        status=overall_status,
        version=os.getenv("APP_VERSION", "1.0.0"),
        environment=os.getenv("ENVIRONMENT", "development"),
        timestamp=datetime.utcnow().isoformat() + "Z",
        uptime_seconds=round(uptime, 2),
        checks=checks
    )
    
    # Return 503 if unhealthy (for load balancer health checks)
    if overall_status == "unhealthy":
        raise HTTPException(status_code=503, detail=health.dict())
    
    return health


@router.get("/api/health/live")
async def liveness_check():
    """
    Simple liveness check - is the process running?
    Used by Kubernetes/container orchestrators.
    """
    return {"status": "alive"}


@router.get("/api/health/ready")
async def readiness_check():
    """
    Readiness check - is the service ready to accept traffic?
    Checks core dependencies only.
    """
    db_check = await check_database()
    redis_check = await check_redis()
    
    if db_check.status == "unhealthy" or redis_check.status == "unhealthy":
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "database": db_check.dict(),
                "redis": redis_check.dict()
            }
        )
    
    return {
        "status": "ready",
        "database": db_check.dict(),
        "redis": redis_check.dict()
    }


# Example usage in main.py:
# from health_check import router as health_router
# app.include_router(health_router)
