from datetime import datetime


def create_notification_document(
    recipient_id,
    recipient_role,
    notification_type,
    title,
    message,
    order_id=None
):
    return {
        "recipient_id": recipient_id,
        "recipient_role": recipient_role,
        "notification_type": notification_type,
        "title": title,
        "message": message,
        "order_id": order_id,
        "is_read": False,
        "created_at": datetime.utcnow()
    }