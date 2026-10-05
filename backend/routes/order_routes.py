from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth.auth_roles import require_role

from schemas.order_schema import (
    OrderCreateSchema,
    OrderResponseSchema,
    OrderHistoryResponseSchema,
    ActiveMealPlanResponseSchema,
    MessOrderResponseSchema,
    OrderStatusUpdateSchema
)

from models.order_model import create_order_document

from database import db


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# =========================================================
# CREATE ORDER
# =========================================================

@router.post("/", response_model=OrderResponseSchema)
def create_order(
    order: OrderCreateSchema,
    current_user=Depends(require_role("STUDENT"))
):

    # -----------------------------------------------------
    # Validate plan type
    # -----------------------------------------------------

    if order.plan_type not in ["ONE_DAY", "MONTHLY"]:
        return {
            "message": "Invalid plan type. Use ONE_DAY or MONTHLY."
        }

    # -----------------------------------------------------
    # Validate meal mode
    # -----------------------------------------------------

    if order.meal_mode not in ["EAT_AT_MESS", "TIFFIN"]:
        return {
            "message": "Invalid meal mode. Use EAT_AT_MESS or TIFFIN."
        }

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    mess_collection = db["messes"]
    menu_collection = db["menus"]
    order_collection = db["orders"]

    # -----------------------------------------------------
    # Check whether mess exists and is approved
    # -----------------------------------------------------

    try:
        mess = mess_collection.find_one({
            "_id": ObjectId(order.mess_id),
            "status": "APPROVED"
        })

    except Exception:
        return {
            "message": "Invalid mess ID"
        }

    if mess is None:
        return {
            "message": "Mess not found or not approved"
        }

    # -----------------------------------------------------
    # Check whether meal belongs to this mess
    # -----------------------------------------------------

    try:
        meal = menu_collection.find_one({
            "_id": ObjectId(order.meal_id),
            "mess_id": order.mess_id
        })

    except Exception:
        return {
            "message": "Invalid meal ID"
        }

    if meal is None:
        return {
            "message": "Meal not found for this mess"
        }

    # -----------------------------------------------------
    # Check meal availability
    # -----------------------------------------------------

    if meal.get("available") is not True:
        return {
            "message": "Selected meal is currently unavailable"
        }

    # -----------------------------------------------------
    # Decide price
    # -----------------------------------------------------

    if order.plan_type == "ONE_DAY":

        price = meal["price"]

    else:

        monthly_price = mess.get("monthly_price")

        if monthly_price is None:
            return {
                "message": "Monthly plan is not configured by this mess"
            }

        price = monthly_price

    # -----------------------------------------------------
    # Decide location
    # -----------------------------------------------------

    if order.meal_mode == "TIFFIN":

        if not order.location:
            return {
                "message": "Location is required for tiffin orders"
            }

        order_location = order.location

    else:

        order_location = mess.get("address")

    # -----------------------------------------------------
    # Check mess capacity
    # -----------------------------------------------------

    max_capacity = mess.get("max_capacity")

    if max_capacity is not None:

        active_order_count = order_collection.count_documents({
            "mess_id": order.mess_id,
            "status": {
                "$in": [
                    "PENDING_PAYMENT",
                    "CONFIRMED",
                    "PREPARING",
                    "READY"
                ]
            }
        })

        if active_order_count >= max_capacity:
            return {
                "message": (
                    "Mess capacity is full. "
                    "New orders are currently unavailable."
                )
            }

    # -----------------------------------------------------
    # Create order document
    # -----------------------------------------------------

    order_document = create_order_document(
        student_id=str(current_user["_id"]),
        mess_id=order.mess_id,
        meal_id=order.meal_id,
        plan_type=order.plan_type,
        meal_mode=order.meal_mode,
        price=price,
        location=order_location
    )

    # -----------------------------------------------------
    # Save order
    # -----------------------------------------------------

    result = order_collection.insert_one(order_document)

    # -----------------------------------------------------
    # Return order details
    # -----------------------------------------------------

    return {
        "order_id": str(result.inserted_id),
        "student_id": str(current_user["_id"]),
        "mess_id": order.mess_id,
        "meal_id": order.meal_id,
        "plan_type": order.plan_type,
        "meal_mode": order.meal_mode,
        "price": price,
        "location": order_location,
        "status": "PENDING_PAYMENT"
    }


# =========================================================
# STUDENT ORDER HISTORY
# =========================================================

@router.get(
    "/my-orders",
    response_model=list[OrderHistoryResponseSchema]
)
def get_my_orders(
    current_user=Depends(require_role("STUDENT"))
):

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    order_collection = db["orders"]
    mess_collection = db["messes"]
    menu_collection = db["menus"]

    # -----------------------------------------------------
    # Find only orders of logged-in student
    # -----------------------------------------------------

    orders = list(
        order_collection.find({
            "student_id": str(current_user["_id"])
        }).sort("created_at", -1)
    )

    result = []

    # -----------------------------------------------------
    # Prepare order history
    # -----------------------------------------------------

    for order in orders:

        # Find mess
        try:
            mess = mess_collection.find_one({
                "_id": ObjectId(order["mess_id"])
            })

        except Exception:
            mess = None

        # Find meal
        try:
            meal = menu_collection.find_one({
                "_id": ObjectId(order["meal_id"])
            })

        except Exception:
            meal = None

        # Get names safely
        mess_name = (
            mess.get("mess_name")
            if mess
            else "Mess not found"
        )

        meal_name = (
            meal.get("meal_name")
            if meal
            else "Meal not found"
        )

        # Get created date
        created_at = order.get("created_at")

        if created_at:
            created_at = created_at.isoformat()
        else:
            created_at = ""

        result.append({
            "order_id": str(order["_id"]),
            "mess_id": order["mess_id"],
            "mess_name": mess_name,
            "meal_id": order["meal_id"],
            "meal_name": meal_name,
            "plan_type": order["plan_type"],
            "meal_mode": order["meal_mode"],
            "price": order["price"],
            "location": order.get("location"),
            "status": order["status"],
            "created_at": created_at
        })

    return result


# =========================================================
# STUDENT ACTIVE MEAL PLAN
# =========================================================

@router.get(
    "/active-plan",
    response_model=ActiveMealPlanResponseSchema
)
def get_active_meal_plan(
    current_user=Depends(require_role("STUDENT"))
):

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    order_collection = db["orders"]
    mess_collection = db["messes"]
    menu_collection = db["menus"]

    # -----------------------------------------------------
    # Find latest monthly order of logged-in student
    # -----------------------------------------------------

    order = order_collection.find_one(
        {
            "student_id": str(current_user["_id"]),
            "plan_type": "MONTHLY"
        },
        sort=[("created_at", -1)]
    )

    # -----------------------------------------------------
    # Check whether monthly plan exists
    # -----------------------------------------------------

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="No active monthly plan found"
        )

    # -----------------------------------------------------
    # Find mess
    # -----------------------------------------------------

    try:
        mess = mess_collection.find_one({
            "_id": ObjectId(order["mess_id"])
        })

    except Exception:
        mess = None

    # -----------------------------------------------------
    # Find meal
    # -----------------------------------------------------

    try:
        meal = menu_collection.find_one({
            "_id": ObjectId(order["meal_id"])
        })

    except Exception:
        meal = None

    # -----------------------------------------------------
    # Get mess name
    # -----------------------------------------------------

    mess_name = (
        mess.get("mess_name")
        if mess
        else "Mess not found"
    )

    # -----------------------------------------------------
    # Get meal name
    # -----------------------------------------------------

    meal_name = (
        meal.get("meal_name")
        if meal
        else "Meal not found"
    )

    # -----------------------------------------------------
    # Convert date to string
    # -----------------------------------------------------

    created_at = order.get("created_at")

    if created_at:
        created_at = created_at.isoformat()
    else:
        created_at = ""

    # -----------------------------------------------------
    # Return active plan
    # -----------------------------------------------------

    return {
        "order_id": str(order["_id"]),
        "mess_id": order["mess_id"],
        "mess_name": mess_name,
        "meal_id": order["meal_id"],
        "meal_name": meal_name,
        "plan_type": order["plan_type"],
        "meal_mode": order["meal_mode"],
        "price": order["price"],
        "location": order.get("location"),
        "status": order["status"],
        "created_at": created_at
    }


# =========================================================
# MESS OWNER → VIEW ORDERS
# =========================================================

@router.get(
    "/mess-orders",
    response_model=list[MessOrderResponseSchema]
)
def get_mess_orders(
    current_user=Depends(require_role("MESS_OWNER"))
):

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    mess_collection = db["messes"]
    order_collection = db["orders"]
    users_collection = db["users"]
    menu_collection = db["menus"]

    # -----------------------------------------------------
    # Find the mess owned by logged-in owner
    # -----------------------------------------------------

    mess = mess_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found"
        )

    mess_id = str(mess["_id"])

    # -----------------------------------------------------
    # Find orders belonging only to this mess
    # -----------------------------------------------------

    orders = list(
        order_collection.find({
            "mess_id": mess_id
        }).sort("created_at", -1)
    )

    result = []

    # -----------------------------------------------------
    # Prepare order information
    # -----------------------------------------------------

    for order in orders:

        # -------------------------------------------------
        # Find student
        # -------------------------------------------------

        try:
            student = users_collection.find_one({
                "_id": ObjectId(order["student_id"])
            })

        except Exception:
            student = None

        # -------------------------------------------------
        # Find meal
        # -------------------------------------------------

        try:
            meal = menu_collection.find_one({
                "_id": ObjectId(order["meal_id"])
            })

        except Exception:
            meal = None

        # -------------------------------------------------
        # Student details
        # -------------------------------------------------

        if student:
            student_name = student.get(
                "name",
                "Student not found"
            )

            student_phone = student.get(
                "phone",
                ""
            )

        else:
            student_name = "Student not found"
            student_phone = ""

        # -------------------------------------------------
        # Meal details
        # -------------------------------------------------

        meal_name = (
            meal.get("meal_name")
            if meal
            else "Meal not found"
        )

        # -------------------------------------------------
        # Convert created date to string
        # -------------------------------------------------

        created_at = order.get("created_at")

        if created_at:
            created_at = created_at.isoformat()
        else:
            created_at = ""

        # -------------------------------------------------
        # Add order to result
        # -------------------------------------------------

        result.append({
            "order_id": str(order["_id"]),
            "student_id": order["student_id"],
            "student_name": student_name,
            "student_phone": student_phone,
            "meal_id": order["meal_id"],
            "meal_name": meal_name,
            "plan_type": order["plan_type"],
            "meal_mode": order["meal_mode"],
            "price": order["price"],
            "location": order.get("location"),
            "status": order["status"],
            "created_at": created_at
        })

    return result


# =========================================================
# MESS OWNER → UPDATE ORDER STATUS
# =========================================================

@router.put("/status/{order_id}")
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdateSchema,
    current_user=Depends(require_role("MESS_OWNER"))
):

    # -----------------------------------------------------
    # Allowed statuses
    # -----------------------------------------------------

    allowed_statuses = [
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED"
    ]

    # -----------------------------------------------------
    # Validate status
    # -----------------------------------------------------

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Use CONFIRMED,COMPLETED or CANCELLED."
            )
        )

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    mess_collection = db["messes"]
    order_collection = db["orders"]

    # -----------------------------------------------------
    # Find the mess owned by logged-in owner
    # -----------------------------------------------------

    mess = mess_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found"
        )

    mess_id = str(mess["_id"])

    # -----------------------------------------------------
    # Validate order ID
    # -----------------------------------------------------

    try:
        order_object_id = ObjectId(order_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid order ID"
        )

    # -----------------------------------------------------
    # Find order belonging to this owner's mess
    # -----------------------------------------------------

    order = order_collection.find_one({
        "_id": order_object_id,
        "mess_id": mess_id
    })

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found for this mess"
        )

    # -----------------------------------------------------
    # Update order status
    # -----------------------------------------------------

    order_collection.update_one(
        {
            "_id": order_object_id,
            "mess_id": mess_id
        },
        {
            "$set": {
                "status": status_update.status
            }
        }
    )

    # -----------------------------------------------------
    # Return updated status
    # -----------------------------------------------------

    return {
        "message": "Order status updated successfully",
        "order_id": order_id,
        "status": status_update.status
    }