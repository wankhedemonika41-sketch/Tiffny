from pydantic import BaseModel
from typing import Optional


class StudentProfileSchema(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str
    role: str
    location: Optional[str] = None