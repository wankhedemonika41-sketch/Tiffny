from pydantic import BaseModel
from typing import Optional


# =========================================================
# MESS REGISTRATION
# =========================================================

class MessRegistrationSchema(BaseModel):
    mess_name: str
    description: str
    phone: str
    address: str
    location: str
    photo: Optional[str] = None
    verification_proof: Optional[str] = None


# =========================================================
# MESS OWNER PROFILE
# =========================================================

class MessProfileSchema(BaseModel):
    mess_id: str
    owner_id: str
    mess_name: str
    description: str
    phone: str
    address: str
    location: str
    photo: Optional[str] = None
    verification_proof: Optional[str] = None
    status: str
    rating: float
    total_reviews: int

    # Capacity
    max_capacity: Optional[int] = None

    # Pricing
    one_time_price: Optional[float] = None
    monthly_price: Optional[float] = None


# =========================================================
# UPDATE MESS PROFILE
# =========================================================

class MessUpdateSchema(BaseModel):
    mess_name: str
    description: str
    phone: str
    address: str
    location: str
    photo: Optional[str] = None
    verification_proof: Optional[str] = None


# =========================================================
# STUDENT MESS DETAILS
# =========================================================

class StudentMessDetailsSchema(BaseModel):
    mess_id: str
    mess_name: str
    description: str
    phone: str
    address: str
    location: str
    photo: Optional[str] = None
    rating: float
    total_reviews: int

    # Capacity
    max_capacity: Optional[int] = None

    # Pricing visible to student
    one_time_price: Optional[float] = None
    monthly_price: Optional[float] = None

    # Available menu
    menu: list


class PublicMessSchema(BaseModel):
    mess_id: str
    mess_name: str
    description: str
    phone: str
    address: str
    location: str
    photo: Optional[str] = None
    rating: float
    total_reviews: int
    max_capacity: Optional[int] = None
    monthly_price: Optional[float] = None
    one_time_price: Optional[float] = None