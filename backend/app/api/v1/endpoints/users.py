"""
User management endpoints
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List

router = APIRouter()


class User(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    organization_id: int | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


@router.get("/me", response_model=User)
async def get_current_user():
    """Get current user profile"""
    # TODO: Get from JWT token
    return {
        "id": 1,
        "email": "user@example.com",
        "full_name": "Test User",
        "is_active": True,
        "organization_id": None
    }


@router.patch("/me", response_model=User)
async def update_current_user(user_update: UserUpdate):
    """Update current user profile"""
    # TODO: Implement update logic
    return {
        "id": 1,
        "email": user_update.email or "user@example.com",
        "full_name": user_update.full_name or "Test User",
        "is_active": True,
        "organization_id": None
    }


@router.get("/", response_model=List[User])
async def list_users():
    """List all users (admin only)"""
    # TODO: Implement with proper authorization
    return []
