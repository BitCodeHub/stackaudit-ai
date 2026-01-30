"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

router = APIRouter()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user"""
    # TODO: Implement user registration with database
    return {
        "id": 1,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "is_active": True
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    # TODO: Implement authentication logic
    # For now, return a mock token
    return {
        "access_token": "mock-token",
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout():
    """Logout (invalidate token)"""
    return {"message": "Successfully logged out"}
