from pydantic import BaseModel
from typing import Optional


# =========================================================
# CREATE ORDER
# =========================================================

class OrderCreateSchema(BaseModel):
    mess_id: str
    meal_id: str
    plan_type: str
    meal_mode: str
    location: Optional[str] = None


# =========================================================
# ORDER RESPONSE
# =========================================================

class OrderResponseSchema(BaseModel):
    order_id: str
    student_id: str
    mess_id: str
    meal_id: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str


# =========================================================
# STUDENT ORDER HISTORY
# =========================================================

class OrderHistoryResponseSchema(BaseModel):
    order_id: str
    mess_id: str
    mess_name: str
    meal_id: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    created_at: str


# =========================================================
# ACTIVE MEAL PLAN
# =========================================================

class ActiveMealPlanResponseSchema(BaseModel):
    order_id: str
    mess_id: str
    mess_name: str
    meal_id: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    created_at: str


# =========================================================
# MESS OWNER ORDER VIEW
# =========================================================

class MessOrderResponseSchema(BaseModel):
    order_id: str
    student_id: str
    student_name: str
    student_phone: str
    meal_id: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    created_at: str


# =========================================================
# UPDATE ORDER STATUS
# =========================================================

class OrderStatusUpdateSchema(BaseModel):
    status: str