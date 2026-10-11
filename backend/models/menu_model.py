from datetime import datetime


def create_menu_document(
    mess_id,
    day,
    lunch,
    dinner,
    holiday
):
    return {
        "mess_id": mess_id,
        "day": day,
        "lunch": lunch,
        "dinner": dinner,
        "holiday": holiday,
        "created_at": datetime.utcnow()
    }