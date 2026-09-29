from pydantic import BaseModel, Field


# =========================================================
# CREATE REVIEW
# =========================================================

class ReviewCreateSchema(BaseModel):
    rating: int = Field(
        ge=1,
        le=5
    )

    review: str


# =========================================================
# REVIEW RESPONSE
# =========================================================

class ReviewResponseSchema(BaseModel):
    review_id: str
    order_id: str
    student_id: str
    mess_id: str
    rating: int
    review: str
    created_at: str