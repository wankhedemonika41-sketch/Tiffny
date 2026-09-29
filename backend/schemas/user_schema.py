from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegistrationSchema(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str
    location: Optional[str] = None


class UserResponseSchema(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str
    location: Optional[str] = None