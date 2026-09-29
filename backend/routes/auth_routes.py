from fastapi import APIRouter, Depends

from schemas.user_schema import UserRegistrationSchema
from schemas.login_schema import UserLoginSchema

from models.user_model import create_user_document

from auth.auth_utils import hash_password, verify_password
from auth.auth_jwt import create_access_token
from auth.auth_dependency import get_current_user
from auth.auth_roles import require_role

from database import users_collection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# REGISTER
# =========================

@router.post("/register")
def register_user(user: UserRegistrationSchema):

    # Check if email already exists
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        return {
            "message": "Email already registered"
        }

    # Hash password before storing
    hashed_password = hash_password(user.password)

    # Create user document
    user_document = create_user_document(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hashed_password,
        role=user.role,
        location=user.location
    )

    # Save user in MongoDB
    result = users_collection.insert_one(user_document)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login_user(user: UserLoginSchema):

    # Find user by email
    existing_user = users_collection.find_one({
        "email": user.email
    })

    # Email not found
    if not existing_user:
        return {
            "message": "Invalid email or password"
        }

    # Check password
    password_is_valid = verify_password(
        user.password,
        existing_user["password"]
    )

    # Password incorrect
    if not password_is_valid:
        return {
            "message": "Invalid email or password"
        }

    # Create JWT access token
    access_token = create_access_token({
        "user_id": str(existing_user["_id"]),
        "role": existing_user["role"],
        "name": existing_user["name"]
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user_id": str(existing_user["_id"]),
        "name": existing_user["name"],
        "role": existing_user["role"]
    }


# =========================
# CURRENT USER
# =========================

@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user)
):

    return {
        "message": "Authenticated user",
        "user_id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "phone": current_user["phone"],
        "role": current_user["role"],
        "location": current_user.get("location")
    }


# =========================
# RBAC TEST ENDPOINTS
# =========================

@router.get("/student-test")
def student_test(
    current_user=Depends(require_role("STUDENT"))
):

    return {
        "message": "Student access granted",
        "name": current_user["name"],
        "role": current_user["role"]
    }


@router.get("/mess-owner-test")
def mess_owner_test(
    current_user=Depends(require_role("MESS_OWNER"))
):

    return {
        "message": "Mess owner access granted",
        "name": current_user["name"],
        "role": current_user["role"]
    }


@router.get("/admin-test")
def admin_test(
    current_user=Depends(require_role("ADMIN"))
):

    return {
        "message": "Admin access granted",
        "name": current_user["name"],
        "role": current_user["role"]
    }