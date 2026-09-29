from fastapi import APIRouter, Depends
from bson import ObjectId

from auth.auth_roles import require_role

from schemas.student_schema import StudentProfileSchema
from schemas.mess_schema import StudentMessDetailsSchema

from database import messes_collection, db


router = APIRouter(
    prefix="/student",
    tags=["Student"]
)


# =========================================================
# STUDENT PROFILE
# =========================================================

@router.get("/profile", response_model=StudentProfileSchema)
def get_student_profile(
    current_user=Depends(require_role("STUDENT"))
):
    return {
        "user_id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "phone": current_user["phone"],
        "role": current_user["role"],
        "location": current_user.get("location")
    }


# =========================================================
# STUDENT DASHBOARD
# =========================================================

@router.get("/dashboard")
def get_student_dashboard(
    current_user=Depends(require_role("STUDENT"))
):
    return {
        "message": "Student dashboard",
        "student": {
            "user_id": str(current_user["_id"]),
            "name": current_user["name"],
            "location": current_user.get("location")
        },
        "available_messes": [],
        "orders": [],
        "active_meal_plan": None
    }


# =========================================================
# VIEW APPROVED MESSES
# =========================================================

@router.get("/messes")
def get_approved_messes(
    current_user=Depends(require_role("STUDENT"))
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
            "mess_name": mess["mess_name"],
            "description": mess["description"],
            "phone": mess["phone"],
            "address": mess["address"],
            "location": mess["location"],
            "photo": mess.get("photo"),
            "rating": mess.get("rating", 0),
            "total_reviews": mess.get("total_reviews", 0),
            "max_capacity": mess.get("max_capacity"),
            "monthly_price": mess.get("monthly_price")
        })

    return {
        "count": len(result),
        "messes": result
    }


# =========================================================
# VIEW SELECTED MESS DETAILS + MENU
# =========================================================

@router.get(
    "/mess/{mess_id}",
    response_model=StudentMessDetailsSchema
)
def get_student_mess_details(
    mess_id: str,
    current_user=Depends(require_role("STUDENT"))
):
    # Find only an approved mess
    mess = messes_collection.find_one({
        "_id": ObjectId(mess_id),
        "status": "APPROVED"
    })

    if mess is None:
        return {
            "message": "Mess not found or not approved"
        }

    # Get menu collection
    menu_collection = db["menus"]

    # Find menu items belonging to this mess
    menu_items = list(
        menu_collection.find({
            "mess_id": mess_id
        })
    )

    menu = []

    for item in menu_items:
        menu.append({
            "meal_id": str(item["_id"]),
            "mess_id": item["mess_id"],
            "meal_name": item["meal_name"],
            "description": item["description"],
            "meal_type": item["meal_type"],
            "price": item["price"],
            "available": item["available"]
        })

    return {
        "mess_id": str(mess["_id"]),
        "mess_name": mess["mess_name"],
        "description": mess["description"],
        "phone": mess["phone"],
        "address": mess["address"],
        "location": mess["location"],
        "photo": mess.get("photo"),
        "rating": mess.get("rating", 0),
        "total_reviews": mess.get("total_reviews", 0),
        "max_capacity": mess.get("max_capacity"),
        "monthly_price": mess.get("monthly_price"),
        "menu": menu
    }