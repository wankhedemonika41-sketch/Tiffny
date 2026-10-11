from pydantic import BaseModel, Field
from typing import Optional


class StudentProfileUpdateSchema(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=15)
    location: str = Field(min_length=2, max_length=250)


class StudentPasswordChangeSchema(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)


class StudentProfileResponseSchema(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    photo: Optional[str] = None