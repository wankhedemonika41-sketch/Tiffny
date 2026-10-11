
from pathlib import Path
from uuid import uuid4
import re

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

from auth.auth_roles import require_role
from auth.auth_utils import hash_password, verify_password
from database import db

from schemas.student_profile_schema import (
    StudentProfileUpdateSchema,
    StudentPasswordChangeSchema,
    StudentProfileResponseSchema,
)


router = APIRouter(
    prefix="/students",
    tags=["Student Profile"],
)


# =========================================================
# PROFILE PHOTO CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads" / "student_profiles"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_PHOTO_SIZE = 5 * 1024 * 1024

ALLOWED_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_student_id(current_user):
    return str(current_user["_id"])


def get_student(current_user):
    student = db["users"].find_one({
        "_id": current_user["_id"],
        "role": "STUDENT",
    })

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student account not found.",
        )

    return student


def profile_response(student):
    return {
        "name": student.get("name", ""),
        "email": student.get("email", ""),
        "phone": student.get("phone", ""),
        "location": student.get("location", ""),
        "photo": student.get("photo"),
    }


# =========================================================
# GET STUDENT PROFILE
# =========================================================

@router.get(
    "/profile",
    response_model=StudentProfileResponseSchema,
)
def get_student_profile(
    current_user=Depends(require_role("STUDENT")),
):
    student = get_student(current_user)

    return profile_response(student)


# =========================================================
# UPDATE STUDENT PROFILE
# =========================================================

@router.put(
    "/profile",
    response_model=StudentProfileResponseSchema,
)
def update_student_profile(
    profile: StudentProfileUpdateSchema,
    current_user=Depends(require_role("STUDENT")),
):
    student = get_student(current_user)

    name = profile.name.strip()
    phone = profile.phone.strip()
    location = profile.location.strip()

    if not name or not location:
        raise HTTPException(
            status_code=400,
            detail="Name and location are required.",
        )

    if not re.fullmatch(r"[0-9+\-\s()]{10,15}", phone):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid phone number.",
        )

    db["users"].update_one(
        {"_id": student["_id"], "role": "STUDENT"},
        {
            "$set": {
                "name": name,
                "phone": phone,
                "location": location,
            }
        },
    )

    updated_student = db["users"].find_one({
        "_id": student["_id"],
        "role": "STUDENT",
    })

    return profile_response(updated_student)


# =========================================================
# UPLOAD STUDENT PROFILE PHOTO
# =========================================================

@router.post("/profile/photo")
async def upload_student_photo(
    photo: UploadFile = File(...),
    current_user=Depends(require_role("STUDENT")),
):
    student = get_student(current_user)

    extension = ALLOWED_PHOTO_TYPES.get(photo.content_type)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Upload a JPG, PNG, or WEBP image.",
        )

    try:
        content = await photo.read(MAX_PHOTO_SIZE + 1)
    finally:
        await photo.close()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(content) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=413,
            detail="The image must be 5 MB or smaller.",
        )

    # Check image signatures rather than trusting
    # the filename or MIME type alone.
    valid_signatures = {
        ".jpg": (b"\xff\xd8\xff",),
        ".png": (b"\x89PNG\r\n\x1a\n",),
        ".webp": (b"RIFF",),
    }

    signatures = valid_signatures[extension]

    if not any(content.startswith(sig) for sig in signatures):
        raise HTTPException(
            status_code=400,
            detail="The file does not appear to be a valid image.",
        )

    if extension == ".webp" and content[8:12] != b"WEBP":
        raise HTTPException(
            status_code=400,
            detail="The file does not appear to be a valid WEBP image.",
        )

    filename = (
        f"{get_student_id(current_user)}_"
        f"{uuid4().hex}{extension}"
    )

    file_path = UPLOAD_DIR / filename

    try:
        file_path.write_bytes(content)
    except OSError:
        raise HTTPException(
            status_code=500,
            detail="Could not save the profile photo.",
        )

    photo_url = f"/uploads/student_profiles/{filename}"

    db["users"].update_one(
        {"_id": student["_id"], "role": "STUDENT"},
        {"$set": {"photo": photo_url}},
    )

    return {
        "message": "Profile photo updated successfully.",
        "photo": photo_url,
    }


# =========================================================
# REMOVE STUDENT PROFILE PHOTO
# =========================================================

@router.delete("/profile/photo")
def remove_student_photo(
    current_user=Depends(require_role("STUDENT")),
):
    student = get_student(current_user)

    db["users"].update_one(
        {"_id": student["_id"], "role": "STUDENT"},
        {"$unset": {"photo": ""}},
    )

    return {
        "message": "Profile photo removed successfully."
    }


# =========================================================
# CHANGE STUDENT PASSWORD
# =========================================================

@router.put("/change-password")
def change_student_password(
    data: StudentPasswordChangeSchema,
    current_user=Depends(require_role("STUDENT")),
):
    student = get_student(current_user)

    # The existing registration and login code stores
    # the password hash in the "password" field.
    stored_hash = student.get("password")

    if not stored_hash:
        raise HTTPException(
            status_code=500,
            detail="Password hash was not found for this account.",
        )

    # Verify the current password using the same utility
    # used by the existing login system.
    try:
        password_is_valid = verify_password(
            data.current_password,
            stored_hash,
        )
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="The stored password hash could not be verified.",
        )

    if not password_is_valid:
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400,
            detail="Choose a different new password.",
        )

    # Hash the new password using the existing auth utility.
    new_hash = hash_password(data.new_password)

    result = db["users"].update_one(
        {
            "_id": student["_id"],
            "role": "STUDENT",
            "password": stored_hash,
        },
        {
            "$set": {
                "password": new_hash,
            }
        },
    )

    if result.matched_count != 1:
        raise HTTPException(
            status_code=409,
            detail=(
                "The password could not be updated because "
                "the account changed. Please try again."
            ),
        )

    return {
        "message": "Password changed successfully."
    }
