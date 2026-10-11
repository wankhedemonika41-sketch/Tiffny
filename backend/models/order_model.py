from datetime import datetime


def create_order_document(
    student_id,
    mess_id,
    day,
    meal_slot,
    meal_name,
    plan_type,
    meal_mode,
    price,
    location=None
):
    return {
        "student_id": student_id,
        "mess_id": mess_id,
        "day": day,
        "meal_slot": meal_slot,
        "meal_name": meal_name,
        "plan_type": plan_type,
        "meal_mode": meal_mode,
        "price": price,
        "location": location,
        "status": "PENDING_OWNER_APPROVAL",
        "created_at": datetime.utcnow()
    }