from pydantic import BaseModel, Field
from typing import Optional


class MealSchema(BaseModel):
    meal_name: str
    description: str
    price: float = Field(gt=0)
    available: bool = True


class MenuCreateSchema(BaseModel):
    day: str
    lunch: Optional[MealSchema] = None
    dinner: Optional[MealSchema] = None
    holiday: bool = False


class MenuUpdateSchema(BaseModel):
    day: str
    lunch: Optional[MealSchema] = None
    dinner: Optional[MealSchema] = None
    holiday: bool = False


class MenuResponseSchema(BaseModel):
    menu_id: str
    mess_id: str
    day: str
    lunch: Optional[MealSchema] = None
    dinner: Optional[MealSchema] = None
    holiday: bool