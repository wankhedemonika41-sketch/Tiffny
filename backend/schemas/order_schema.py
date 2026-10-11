from pydantic import BaseModel
from typing import Optional


# =========================================================
# CREATE ORDER
# =========================================================

class OrderCreateSchema(BaseModel):
    mess_id: str
    plan_type: str
    meal_slot: Optional[str] = None
    meal_mode: str
    location: Optional[str] = None


# =========================================================
# ORDER RESPONSE
# =========================================================

class OrderResponseSchema(BaseModel):
    order_id: str
    student_id: str
    mess_id: str
    day: str
    meal_slot: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# =========================================================
# STUDENT ORDER HISTORY
# =========================================================

class OrderHistoryResponseSchema(BaseModel):
    order_id: str
    mess_id: str
    mess_name: str
    day: str
    meal_slot: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    created_at: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    # Monthly plan dates
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# =========================================================
# ACTIVE MEAL PLAN
# =========================================================

class ActiveMealPlanResponseSchema(BaseModel):
    order_id: str
    mess_id: str
    mess_name: str
    day: str
    meal_slot: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    created_at: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# =========================================================
# MESS OWNER → VIEW ORDERS
# =========================================================

class MessOrderResponseSchema(BaseModel):
    order_id: str
    student_id: str
    student_name: str
    student_phone: str
    day: str
    meal_slot: str
    meal_name: str
    plan_type: str
    meal_mode: str
    price: float
    location: Optional[str] = None
    status: str
    created_at: str

    # Monthly plan dates
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# =========================================================
# UPDATE ORDER STATUS
# =========================================================

class OrderStatusUpdateSchema(BaseModel):
    status: str