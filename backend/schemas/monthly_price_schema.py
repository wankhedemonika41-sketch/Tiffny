from pydantic import BaseModel, Field


class MonthlyPriceUpdateSchema(BaseModel):
    monthly_price: float = Field(gt=0)