from pydantic import BaseModel
from typing import Optional


class NotificationResponseSchema(BaseModel):
    notification_id: str
    recipient_id: str
    recipient_role: str
    notification_type: str
    title: str
    message: str
    order_id: Optional[str] = None
    is_read: bool
    created_at: str