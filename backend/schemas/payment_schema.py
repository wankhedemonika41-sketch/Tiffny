from pydantic import BaseModel


# =========================================================
# CREATE PAYMENT
# =========================================================

class PaymentCreateSchema(BaseModel):
    payment_method: str


# =========================================================
# PAYMENT RESPONSE
# =========================================================

class PaymentResponseSchema(BaseModel):
    payment_id: str
    order_id: str
    student_id: str
    amount: float
    payment_method: str
    payment_status: str