from datetime import datetime


def create_menu_document(
    mess_id,
    meal_name,
    description,
    meal_type,
    price,
    available
):
    return {
        "mess_id": mess_id,
        "meal_name": meal_name,
        "description": description,
        "meal_type": meal_type,
        "price": price,
        "available": available,
        "created_at": datetime.utcnow()
    }