from datetime import datetime


def create_payment_document(
    order_id,
    student_id,
    amount,
    payment_method
):
    return {
        "order_id": order_id,
        "student_id": student_id,
        "amount": amount,
        "payment_method": payment_method,
        "payment_status": "SUCCESS",
        "created_at": datetime.utcnow()
    }