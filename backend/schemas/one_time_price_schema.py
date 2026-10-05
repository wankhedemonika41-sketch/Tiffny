from pydantic import BaseModel, Field


class OneTimePriceUpdateSchema(BaseModel):
    one_time_price: float = Field(gt=0)