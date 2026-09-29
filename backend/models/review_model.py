from datetime import datetime


def create_review_document(
    order_id,
    student_id,
    mess_id,
    rating,
    review
):
    return {
        "order_id": order_id,
        "student_id": student_id,
        "mess_id": mess_id,
        "rating": rating,
        "review": review,
        "created_at": datetime.utcnow()
    }