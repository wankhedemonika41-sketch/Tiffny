from datetime import datetime


def create_mess_document(
    owner_id,
    mess_name,
    description,
    phone,
    address,
    location,
    photo=None,
    verification_proof=None
):
    return {
        "owner_id": owner_id,
        "mess_name": mess_name,
        "description": description,
        "phone": phone,
        "address": address,
        "location": location,
        "photo": photo,
        "verification_proof": verification_proof,
        "status": "PENDING",
        "rating": 0,
        "total_reviews": 0,
        "created_at": datetime.utcnow()
    }