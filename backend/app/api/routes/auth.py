"""
Authentication routes - handles user registration and login
"""

import logging
import hashlib
import secrets
import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, validator
import re

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple file-based user storage (for development)
# In production, use a proper database
USERS_FILE = Path(__file__).resolve().parent.parent.parent.parent / "data" / "users.json"
USERS_FILE.parent.mkdir(parents=True, exist_ok=True)


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6)
    
    @validator('email')
    def validate_email(cls, v):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()


class UserLogin(BaseModel):
    email: str = Field(..., min_length=5)
    password: str
    
    @validator('email')
    def validate_email(cls, v):
        return v.lower()  # Normalize email to lowercase


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str
    created_at: str


def _load_users() -> Dict[str, Any]:
    """Load users from file"""
    if USERS_FILE.exists():
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading users: {e}")
    return {}


def _save_users(users: Dict[str, Any]):
    """Save users to file"""
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving users: {e}")


def _hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = "eloquentai_salt_"  # In production, use unique salt per user
    return hashlib.sha256((salt + password).encode()).hexdigest()


def _generate_token() -> str:
    """Generate a secure token"""
    return secrets.token_urlsafe(32)


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        users = _load_users()
        
        # Check if email already exists
        for user_id, user in users.items():
            if user.get('email') == user_data.email:
                raise HTTPException(
                    status_code=400,
                    detail="Email already registered"
                )
        
        # Create new user
        user_id = secrets.token_urlsafe(16)
        token = _generate_token()
        
        new_user = {
            'id': user_id,
            'name': user_data.name,
            'email': user_data.email,
            'password_hash': _hash_password(user_data.password),
            'token': token,
            'created_at': datetime.now().isoformat(),
            'last_login': datetime.now().isoformat()
        }
        
        users[user_id] = new_user
        _save_users(users)
        
        logger.info(f"New user registered: {user_data.email}")
        
        return UserResponse(
            id=user_id,
            name=new_user['name'],
            email=new_user['email'],
            token=token,
            created_at=new_user['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    try:
        users = _load_users()
        password_hash = _hash_password(credentials.password)
        
        # Find user by email
        for user_id, user in users.items():
            if user.get('email') == credentials.email:
                if user.get('password_hash') == password_hash:
                    # Generate new token
                    token = _generate_token()
                    user['token'] = token
                    user['last_login'] = datetime.now().isoformat()
                    _save_users(users)
                    
                    logger.info(f"User logged in: {credentials.email}")
                    
                    return UserResponse(
                        id=user_id,
                        name=user['name'],
                        email=user['email'],
                        token=token,
                        created_at=user['created_at']
                    )
                else:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid password"
                    )
        
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout(token: str):
    """Logout - invalidate token"""
    try:
        users = _load_users()
        
        for user_id, user in users.items():
            if user.get('token') == token:
                user['token'] = None
                _save_users(users)
                logger.info(f"User logged out: {user['email']}")
                return {"message": "Logged out successfully"}
        
        return {"message": "Token not found or already invalid"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me")
async def get_current_user(token: str):
    """Get current user from token"""
    try:
        users = _load_users()
        
        for user_id, user in users.items():
            if user.get('token') == token:
                return {
                    "id": user_id,
                    "name": user['name'],
                    "email": user['email'],
                    "created_at": user['created_at'],
                    "last_login": user.get('last_login')
                }
        
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

