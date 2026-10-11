from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth.auth_roles import require_role

from schemas.notification_schema import (
    NotificationResponseSchema
)

from database import db


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# STUDENT NOTIFICATIONS
# =========================================================

@router.get(
    "/student",
    response_model=list[NotificationResponseSchema]
)
def get_student_notifications(
    current_user=Depends(require_role("STUDENT"))
):

    notification_collection = db["notifications"]

    notifications = notification_collection.find(
        {
            "recipient_id": str(current_user["_id"]),
            "recipient_role": "STUDENT"
        }
    ).sort(
        "created_at",
        -1
    )

    result = []

    for notification in notifications:
        result.append({
            "notification_id": str(notification["_id"]),
            "recipient_id": notification["recipient_id"],
            "recipient_role": notification["recipient_role"],
            "notification_type": notification["notification_type"],
            "title": notification["title"],
            "message": notification["message"],
            "order_id": notification.get("order_id"),
            "is_read": notification["is_read"],
            "created_at": notification["created_at"].isoformat()
        })

    return result


# =========================================================
# MESS OWNER NOTIFICATIONS
# =========================================================

@router.get(
    "/owner",
    response_model=list[NotificationResponseSchema]
)
def get_owner_notifications(
    current_user=Depends(require_role("MESS_OWNER"))
):

    notification_collection = db["notifications"]

    notifications = notification_collection.find(
        {
            "recipient_id": str(current_user["_id"]),
            "recipient_role": "MESS_OWNER"
        }
    ).sort(
        "created_at",
        -1
    )

    result = []

    for notification in notifications:
        result.append({
            "notification_id": str(notification["_id"]),
            "recipient_id": notification["recipient_id"],
            "recipient_role": notification["recipient_role"],
            "notification_type": notification["notification_type"],
            "title": notification["title"],
            "message": notification["message"],
            "order_id": notification.get("order_id"),
            "is_read": notification["is_read"],
            "created_at": notification["created_at"].isoformat()
        })

    return result


# =========================================================
# MARK STUDENT NOTIFICATION AS READ
# =========================================================

@router.put(
    "/student/{notification_id}/read"
)
def mark_student_notification_read(
    notification_id: str,
    current_user=Depends(require_role("STUDENT"))
):

    try:
        notification_object_id = ObjectId(
            notification_id
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = db["notifications"].update_one(
        {
            "_id": notification_object_id,
            "recipient_id": str(current_user["_id"]),
            "recipient_role": "STUDENT"
        },
        {
            "$set": {
                "is_read": True
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification marked as read"
    }


# =========================================================
# MARK OWNER NOTIFICATION AS READ
# =========================================================

@router.put(
    "/owner/{notification_id}/read"
)
def mark_owner_notification_read(
    notification_id: str,
    current_user=Depends(require_role("MESS_OWNER"))
):

    try:
        notification_object_id = ObjectId(
            notification_id
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = db["notifications"].update_one(
        {
            "_id": notification_object_id,
            "recipient_id": str(current_user["_id"]),
            "recipient_role": "MESS_OWNER"
        },
        {
            "$set": {
                "is_read": True
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification marked as read"
    }