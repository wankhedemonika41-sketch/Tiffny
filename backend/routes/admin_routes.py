from fastapi import APIRouter, Depends
from bson import ObjectId
from pydantic import BaseModel

from auth.auth_roles import require_role
from database import messes_collection


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ------------------------------------------------
# Suspension Request Schema
# ------------------------------------------------

class SuspendMessSchema(BaseModel):
    reason: str


# ------------------------------------------------
# PENDING MESSES
# ------------------------------------------------

@router.get("/pending-messes")
def get_pending_messes(
    current_user=Depends(require_role("ADMIN"))
):
    messes = list(
        messes_collection.find({
            "status": "PENDING"
        })
    )

    result = []

    for mess in messes:
        result.append({
            "mess_id": str(mess["_id"]),
            "owner_id": mess["owner_id"],
            "mess_name": mess["mess_name"],
            "description": mess["description"],
            "phone": mess["phone"],
            "address": mess["address"],
            "location": mess["location"],
            "photo": mess.get("photo"),
            "verification_proof": mess.get("verification_proof"),
            "status": mess["status"]
        })

    return {
        "count": len(result),
        "pending_messes": result
    }


# ------------------------------------------------
# APPROVED MESSES
# ------------------------------------------------

@router.get("/approved-messes")
def get_approved_messes(
    current_user=Depends(require_role("ADMIN"))
):
    messes = list(
        messes_collection.find({
            "status": "APPROVED"
        })
    )

    result = []

    for mess in messes:
        result.append({
            "mess_id": str(mess["_id"]),
            "owner_id": mess["owner_id"],
            "mess_name": mess["mess_name"],
            "description": mess["description"],
            "phone": mess["phone"],
            "address": mess["address"],
            "location": mess["location"],
            "photo": mess.get("photo"),
            "verification_proof": mess.get("verification_proof"),
            "status": mess["status"]
        })

    return {
        "count": len(result),
        "approved_messes": result
    }


# ------------------------------------------------
# REJECTED MESSES
# ------------------------------------------------

@router.get("/rejected-messes")
def get_rejected_messes(
    current_user=Depends(require_role("ADMIN"))
):
    messes = list(
        messes_collection.find({
            "status": "REJECTED"
        })
    )

    result = []

    for mess in messes:
        result.append({
            "mess_id": str(mess["_id"]),
            "owner_id": mess["owner_id"],
            "mess_name": mess["mess_name"],
            "description": mess["description"],
            "phone": mess["phone"],
            "address": mess["address"],
            "location": mess["location"],
            "photo": mess.get("photo"),
            "verification_proof": mess.get("verification_proof"),
            "status": mess["status"]
        })

    return {
        "count": len(result),
        "rejected_messes": result
    }


# ------------------------------------------------
# SUSPENDED MESSES
# ------------------------------------------------

@router.get("/suspended-messes")
def get_suspended_messes(
    current_user=Depends(require_role("ADMIN"))
):
    messes = list(
        messes_collection.find({
            "status": "SUSPENDED"
        })
    )

    result = []

    for mess in messes:
        result.append({
            "mess_id": str(mess["_id"]),
            "owner_id": mess["owner_id"],
            "mess_name": mess["mess_name"],
            "description": mess["description"],
            "phone": mess["phone"],
            "address": mess["address"],
            "location": mess["location"],
            "photo": mess.get("photo"),
            "verification_proof": mess.get("verification_proof"),
            "status": mess["status"],

            # Suspension reason
            "suspension_reason": mess.get(
                "suspension_reason"
            )
        })

    return {
        "count": len(result),
        "suspended_messes": result
    }


# ------------------------------------------------
# APPROVE MESS
# ------------------------------------------------

@router.put("/approve-mess/{mess_id}")
def approve_mess(
    mess_id: str,
    current_user=Depends(require_role("ADMIN"))
):
    result = messes_collection.update_one(
        {
            "_id": ObjectId(mess_id),
            "status": "PENDING"
        },
        {
            "$set": {
                "status": "APPROVED"
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Mess not found or already processed"
        }

    return {
        "message": "Mess approved successfully",
        "mess_id": mess_id,
        "status": "APPROVED"
    }


# ------------------------------------------------
# REJECT MESS
# ------------------------------------------------

@router.put("/reject-mess/{mess_id}")
def reject_mess(
    mess_id: str,
    current_user=Depends(require_role("ADMIN"))
):
    result = messes_collection.update_one(
        {
            "_id": ObjectId(mess_id),
            "status": "PENDING"
        },
        {
            "$set": {
                "status": "REJECTED"
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Mess not found or already processed"
        }

    return {
        "message": "Mess rejected successfully",
        "mess_id": mess_id,
        "status": "REJECTED"
    }


# ------------------------------------------------
# SUSPEND MESS WITH REASON
# ------------------------------------------------

@router.put("/suspend-mess/{mess_id}")
def suspend_mess(
    mess_id: str,
    suspension: SuspendMessSchema,
    current_user=Depends(require_role("ADMIN"))
):
    reason = suspension.reason.strip()

    if not reason:
        return {
            "message": "Suspension reason is required"
        }

    result = messes_collection.update_one(
        {
            "_id": ObjectId(mess_id),
            "status": "APPROVED"
        },
        {
            "$set": {
                "status": "SUSPENDED",
                "suspension_reason": reason
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": (
                "Mess not found or mess is not currently approved"
            )
        }

    return {
        "message": "Mess suspended successfully",
        "mess_id": mess_id,
        "status": "SUSPENDED",
        "suspension_reason": reason
    }


# ------------------------------------------------
# REACTIVATE MESS
# ------------------------------------------------

@router.put("/reactivate-mess/{mess_id}")
def reactivate_mess(
    mess_id: str,
    current_user=Depends(require_role("ADMIN"))
):
    result = messes_collection.update_one(
        {
            "_id": ObjectId(mess_id),
            "status": "SUSPENDED"
        },
        {
            "$set": {
                "status": "APPROVED"
            },
            "$unset": {
                "suspension_reason": ""
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": (
                "Mess not found or mess is not currently suspended"
            )
        }

    return {
        "message": "Mess reactivated successfully",
        "mess_id": mess_id,
        "status": "APPROVED"
    }