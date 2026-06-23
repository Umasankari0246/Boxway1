from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserSchema(BaseModel):
    userId: Optional[str]
    email: str = Field(...)
    password: str = Field(...)
    name: str = Field(...)
    role: str = Field(...)
    department: Optional[str]
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateUserSchema(BaseModel):
    email: Optional[str]
    password: Optional[str]
    name: Optional[str]
    role: Optional[str]
    department: Optional[str]

class LoginSchema(BaseModel):
    email: str = Field(...)
    password: str = Field(...)

def user_helper(user) -> dict:
    return {
        "id": user.get("userId") or str(user["_id"]),
        "userId": user.get("userId"),
        "email": user.get("email"),
        "name": user.get("name"),
        "role": user.get("role"),
        "department": user.get("department"),
        "createdAt": user.get("createdAt"),
        "updatedAt": user.get("updatedAt")
    }
