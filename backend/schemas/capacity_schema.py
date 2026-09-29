from pydantic import BaseModel, Field


class CapacityUpdateSchema(BaseModel):
    max_capacity: int = Field(gt=0)