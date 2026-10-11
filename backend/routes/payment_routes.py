from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from datetime import datetime, timedelta
import calendar

from auth.auth_roles import require_role

from schemas.payment_schema import (
    PaymentCreateSchema,
    PaymentResponseSchema
)

from models.payment_model import create_payment_document
from models.notification_model import create_notification_document

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
    notification_collection = db["notifications"]
    mess_collection = db["messes"]

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
    # Payment date
    # -----------------------------------------------------

    payment_date = datetime.utcnow()

    # -----------------------------------------------------
    # Prepare order update
    # -----------------------------------------------------

    order_update = {
        "status": "ACTIVE",
        "payment_date": payment_date
    }

    # -----------------------------------------------------
    # MONTHLY PLAN
    # -----------------------------------------------------

    if order.get("plan_type") == "MONTHLY":

        # Start date = successful payment date
        start_date = payment_date

        # Find the same day in the next month
        year = start_date.year
        month = start_date.month

        if month == 12:
            next_month = 1
            next_year = year + 1
        else:
            next_month = month + 1
            next_year = year

        # Handle months having different number of days
        last_day_of_next_month = calendar.monthrange(
            next_year,
            next_month
        )[1]

        next_month_day = min(
            start_date.day,
            last_day_of_next_month
        )

        next_month_date = start_date.replace(
            year=next_year,
            month=next_month,
            day=next_month_day
        )

        # Membership ends one day before next month's
        # corresponding start date.
        #
        # Example:
        # Start: 08 Oct
        # End:   07 Nov

        end_date = next_month_date - timedelta(days=1)

        order_update["start_date"] = start_date
        order_update["end_date"] = end_date

    # -----------------------------------------------------
    # UPDATE ORDER
    # -----------------------------------------------------

    order_collection.update_one(
        {
            "_id": order_object_id,
            "student_id": str(current_user["_id"])
        },
        {
            "$set": order_update
        }
    )

    # -----------------------------------------------------
    # Find mess
    # -----------------------------------------------------

    mess = mess_collection.find_one({
        "_id": ObjectId(order["mess_id"])
    })

    # -----------------------------------------------------
    # Notify mess owner about payment
    # -----------------------------------------------------

    if mess and mess.get("owner_id"):

        notification_document = create_notification_document(
            recipient_id=str(mess["owner_id"]),
            recipient_role="MESS_OWNER",
            notification_type="PAYMENT_RECEIVED",
            title="Payment Received",
            message=(
                f"Student has completed payment for "
                f"order #{order_id}."
            ),
            order_id=order_id
        )

        notification_collection.insert_one(
            notification_document
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