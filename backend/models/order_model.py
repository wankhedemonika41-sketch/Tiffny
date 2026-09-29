from datetime import datetime


def create_order_document(
    student_id,
    mess_id,
    meal_id,
    plan_type,
    meal_mode,
    price,
    location=None
):
    return {
        "student_id": student_id,
        "mess_id": mess_id,
        "meal_id": meal_id,
        "plan_type": plan_type,
        "meal_mode": meal_mode,
        "price": price,
        "location": location,
        "status": "PENDING_PAYMENT",
        "created_at": datetime.utcnow()
    }