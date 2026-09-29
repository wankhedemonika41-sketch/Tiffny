from pydantic import BaseModel, Field


class MenuCreateSchema(BaseModel):
    meal_name: str
    description: str
    meal_type: str
    price: float = Field(gt=0)
    available: bool = True


class MenuUpdateSchema(BaseModel):
    meal_name: str
    description: str
    meal_type: str
    price: float = Field(gt=0)
    available: bool


class MenuResponseSchema(BaseModel):
    meal_id: str
    mess_id: str
    meal_name: str
    description: str
    meal_type: str
    price: float
    available: bool