from datetime import datetime


def create_user_document(
    name,
    email,
    phone,
    password,
    role,
    location
):
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "password": password,
        "role": role,
        "location": location,
        "created_at": datetime.utcnow()
    }