from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth.auth_roles import require_role

from schemas.payment_schema import (
    PaymentCreateSchema,
    PaymentResponseSchema
)

from models.payment_model import create_payment_document

from database import db


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# =========================================================
# MAKE PAYMENT
# =========================================================

@router.post(
    "/{order_id}",
    response_model=PaymentResponseSchema
)
def make_payment(
    order_id: str,
    payment: PaymentCreateSchema,
    current_user=Depends(require_role("STUDENT"))
):

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    order_collection = db["orders"]
    payment_collection = db["payments"]

    # -----------------------------------------------------
    # Validate order ID
    # -----------------------------------------------------

    try:
        order_object_id = ObjectId(order_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID"
        )

    # -----------------------------------------------------
    # Find student's order
    # -----------------------------------------------------

    order = order_collection.find_one({
        "_id": order_object_id,
        "student_id": str(current_user["_id"])
    })

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # -----------------------------------------------------
    # Check order status
    # -----------------------------------------------------

    if order["status"] != "PENDING_PAYMENT":
        raise HTTPException(
            status_code=400,
            detail="Payment is not available for this order"
        )

    # -----------------------------------------------------
    # Validate payment method
    # -----------------------------------------------------

    if payment.payment_method not in [
        "DEMO",
        "CASH"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method"
        )

    # -----------------------------------------------------
    # Check whether payment already exists
    # -----------------------------------------------------

    existing_payment = payment_collection.find_one({
        "order_id": order_id,
        "payment_status": "SUCCESS"
    })

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment already completed for this order"
        )

    # -----------------------------------------------------
    # Create payment document
    # -----------------------------------------------------

    payment_document = create_payment_document(
        order_id=order_id,
        student_id=str(current_user["_id"]),
        amount=order["price"],
        payment_method=payment.payment_method
    )

    # -----------------------------------------------------
    # Save payment
    # -----------------------------------------------------

    result = payment_collection.insert_one(
        payment_document
    )

    # -----------------------------------------------------
    # Update order status
    # -----------------------------------------------------

    order_collection.update_one(
        {
            "_id": order_object_id,
            "student_id": str(current_user["_id"])
        },
        {
            "$set": {
                "status": "CONFIRMED"
            }
        }
    )

    # -----------------------------------------------------
    # Return payment details
    # -----------------------------------------------------

    return {
        "payment_id": str(result.inserted_id),
        "order_id": order_id,
        "student_id": str(current_user["_id"]),
        "amount": order["price"],
        "payment_method": payment.payment_method,
        "payment_status": "SUCCESS"
    }