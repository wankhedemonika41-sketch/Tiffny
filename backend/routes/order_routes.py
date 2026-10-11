
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth.auth_roles import require_role

from schemas.order_schema import (
    OrderCreateSchema,
    OrderResponseSchema,
    OrderHistoryResponseSchema,
    ActiveMealPlanResponseSchema,
    MessOrderResponseSchema,
    OrderStatusUpdateSchema,
)

from models.order_model import create_order_document
from models.notification_model import create_notification_document

from database import db


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


# =========================================================
# CREATE ORDER
# =========================================================

@router.post("/", response_model=OrderResponseSchema)
def create_order(
    order: OrderCreateSchema,
    current_user=Depends(require_role("STUDENT")),
):
    # -----------------------------------------------------
    # Validate plan type
    # -----------------------------------------------------

    if order.plan_type not in ["ONE_DAY", "MONTHLY"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid plan type. Use ONE_DAY or MONTHLY.",
        )

    # -----------------------------------------------------
    # Validate meal slot
    # -----------------------------------------------------

    if order.plan_type == "ONE_DAY":
        if order.meal_slot not in ["LUNCH", "DINNER"]:
            raise HTTPException(
                status_code=400,
                detail="For one-day orders, select LUNCH or DINNER.",
            )
    else:
        if order.meal_slot not in [None, "", "BOTH"]:
            raise HTTPException(
                status_code=400,
                detail="Monthly plans include both Lunch and Dinner.",
            )

    # -----------------------------------------------------
    # Validate meal mode
    # -----------------------------------------------------

    if order.meal_mode not in ["EAT_AT_MESS", "TIFFIN"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid meal mode. Use EAT_AT_MESS or TIFFIN.",
        )

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    mess_collection = db["messes"]
    menu_collection = db["menus"]
    order_collection = db["orders"]
    notification_collection = db["notifications"]

    # -----------------------------------------------------
    # Check mess exists and is approved
    # -----------------------------------------------------

    try:
        mess = mess_collection.find_one(
            {
                "_id": ObjectId(order.mess_id),
                "status": "APPROVED",
            }
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid mess ID",
        )

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess not found or not approved",
        )

    # -----------------------------------------------------
    # Get today's day
    # -----------------------------------------------------

    today = datetime.now().strftime("%A").upper()

    # -----------------------------------------------------
    # Variables
    # -----------------------------------------------------

    meal_name = ""
    meal_slot = ""
    price = 0.0

    # =====================================================
    # ONE-DAY ORDER
    # =====================================================

    if order.plan_type == "ONE_DAY":

        # -------------------------------------------------
        # Find today's menu
        # -------------------------------------------------

        menu = menu_collection.find_one(
            {
                "mess_id": order.mess_id,
                "day": today,
            }
        )

        if menu is None:
            raise HTTPException(
                status_code=404,
                detail=f"Menu is not configured for {today}.",
            )

        # -------------------------------------------------
        # Check holiday
        # -------------------------------------------------

        if menu.get("holiday") is True:
            raise HTTPException(
                status_code=400,
                detail=f"{today} is a holiday for this mess.",
            )

        # -------------------------------------------------
        # Get selected meal
        # -------------------------------------------------

        selected_meal = menu.get(order.meal_slot.lower())

        if selected_meal is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"{order.meal_slot.title()} "
                    f"is not available for {today}."
                ),
            )

        # -------------------------------------------------
        # Check meal availability
        # -------------------------------------------------

        if selected_meal.get("available") is not True:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"{order.meal_slot.title()} "
                    "is currently unavailable."
                ),
            )

        # -------------------------------------------------
        # Get meal name
        # -------------------------------------------------

        meal_name = selected_meal.get("meal_name")

        if not meal_name:
            raise HTTPException(
                status_code=400,
                detail="Selected meal does not have a meal name.",
            )

        # -------------------------------------------------
        # Get meal price
        # -------------------------------------------------

        meal_price = selected_meal.get("price")

        if meal_price is None:
            raise HTTPException(
                status_code=400,
                detail="Price is not configured for this meal.",
            )

        price = float(meal_price)
        meal_slot = order.meal_slot

    # =====================================================
    # MONTHLY ORDER
    # =====================================================

    else:

        # -------------------------------------------------
        # Get monthly price
        # -------------------------------------------------

        monthly_price = mess.get("monthly_price")

        if monthly_price is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Monthly plan is not configured "
                    "by this mess."
                ),
            )

        # -------------------------------------------------
        # Monthly includes both meals
        # -------------------------------------------------

        meal_slot = "BOTH"
        meal_name = "Lunch + Dinner"
        price = float(monthly_price)

    # =====================================================
    # DECIDE ORDER LOCATION
    # =====================================================

    if order.meal_mode == "TIFFIN":

        # Tiffin orders must use the student's entered
        # delivery address.

        if not order.location or not order.location.strip():
            raise HTTPException(
                status_code=400,
                detail="Location is required for tiffin orders.",
            )

        order_location = order.location.strip()

    else:

        # Eat-at-mess orders use the physical mess address.
        # Fall back to the mess location if address is absent.

        order_location = (
            mess.get("address")
            or mess.get("location")
            or "Mess location not available"
        )

    # -----------------------------------------------------
    # Check mess capacity
    # -----------------------------------------------------

    max_capacity = mess.get("max_capacity")

    if max_capacity is not None:
        active_order_count = order_collection.count_documents(
            {
                "mess_id": order.mess_id,
                "status": {
                    "$in": [
                        "PENDING_OWNER_APPROVAL",
                        "PENDING_PAYMENT",
                        "ACTIVE",
                        "CONFIRMED",
                        "PREPARING",
                        "READY",
                    ]
                },
            }
        )

        if active_order_count >= max_capacity:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Mess capacity is full. "
                    "New orders are currently unavailable."
                ),
            )

    # -----------------------------------------------------
    # Create order document
    # -----------------------------------------------------

    order_document = create_order_document(
        student_id=str(current_user["_id"]),
        mess_id=order.mess_id,
        day=today,
        meal_slot=meal_slot,
        meal_name=meal_name,
        plan_type=order.plan_type,
        meal_mode=order.meal_mode,
        price=price,
        location=order_location,
    )

    # -----------------------------------------------------
    # Save order
    # -----------------------------------------------------

    result = order_collection.insert_one(order_document)
    order_id = str(result.inserted_id)

    # =====================================================
    # NOTIFICATION → MESS OWNER
    # =====================================================

    owner_id = mess.get("owner_id")

    if owner_id:
        notification_document = create_notification_document(
            recipient_id=str(owner_id),
            recipient_role="MESS_OWNER",
            notification_type="NEW_ORDER",
            title="New Order Received",
            message=(
                "A student has placed a new "
                f"{order.plan_type.lower().replace('_', ' ')} "
                "order at your mess."
            ),
            order_id=order_id,
        )

        notification_collection.insert_one(notification_document)

    # -----------------------------------------------------
    # Return order details
    # -----------------------------------------------------

    return {
        "order_id": order_id,
        "student_id": str(current_user["_id"]),
        "mess_id": order.mess_id,
        "day": today,
        "meal_slot": meal_slot,
        "meal_name": meal_name,
        "plan_type": order.plan_type,
        "meal_mode": order.meal_mode,
        "price": price,
        "location": order_location,
        "status": "PENDING_OWNER_APPROVAL",
        "start_date": None,
        "end_date": None,
    }


# =========================================================
# STUDENT ORDER HISTORY
# =========================================================

@router.get(
    "/my-orders",
    response_model=list[OrderHistoryResponseSchema],
)
def get_my_orders(
    current_user=Depends(require_role("STUDENT")),
):
    order_collection = db["orders"]
    mess_collection = db["messes"]

    orders = list(
        order_collection.find(
            {
                "student_id": str(current_user["_id"]),
            }
        ).sort("created_at", -1)
    )

    result = []

    for order in orders:
        try:
            mess = mess_collection.find_one(
                {
                    "_id": ObjectId(order["mess_id"]),
                }
            )
        except Exception:
            mess = None

        mess_name = (
            mess.get("mess_name")
            if mess
            else "Mess not found"
        )

        created_at = order.get("created_at")

        if created_at:
            created_at = created_at.isoformat()
        else:
            created_at = ""

        start_date = order.get("start_date")

        if start_date:
            start_date = start_date.isoformat()
        else:
            start_date = None

        end_date = order.get("end_date")

        if end_date:
            end_date = end_date.isoformat()
        else:
            end_date = None

        result.append(
            {
                "order_id": str(order["_id"]),
                "mess_id": order["mess_id"],
                "mess_name": mess_name,
                "day": order.get("day", ""),
                "meal_slot": order.get("meal_slot", ""),
                "meal_name": order.get(
                    "meal_name",
                    "Meal not found",
                ),
                "plan_type": order["plan_type"],
                "meal_mode": order["meal_mode"],
                "price": order["price"],
                "location": order.get("location"),
                "status": order["status"],
                "created_at": created_at,
                "start_date": start_date,
                "end_date": end_date,
            }
        )

    return result


# =========================================================
# STUDENT ACTIVE MEAL PLAN
# =========================================================

@router.get(
    "/active-plan",
    response_model=ActiveMealPlanResponseSchema,
)
def get_active_meal_plan(
    current_user=Depends(require_role("STUDENT")),
):
    order_collection = db["orders"]
    mess_collection = db["messes"]

    order = order_collection.find_one(
        {
            "student_id": str(current_user["_id"]),
            "plan_type": "MONTHLY",
            "status": {
                "$in": [
                    "PENDING_PAYMENT",
                    "ACTIVE",
                    "CONFIRMED",
                    "PREPARING",
                    "READY",
                ]
            },
        },
        sort=[("created_at", -1)],
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="No active monthly plan found",
        )

    try:
        mess = mess_collection.find_one(
            {
                "_id": ObjectId(order["mess_id"]),
            }
        )
    except Exception:
        mess = None

    mess_name = (
        mess.get("mess_name")
        if mess
        else "Mess not found"
    )

    created_at = order.get("created_at")

    if created_at:
        created_at = created_at.isoformat()
    else:
        created_at = ""

    start_date = order.get("start_date")

    if start_date:
        start_date = start_date.isoformat()
    else:
        start_date = None

    end_date = order.get("end_date")

    if end_date:
        end_date = end_date.isoformat()
    else:
        end_date = None

    return {
        "order_id": str(order["_id"]),
        "mess_id": order["mess_id"],
        "mess_name": mess_name,
        "day": order.get("day", ""),
        "meal_slot": order.get("meal_slot", "BOTH"),
        "meal_name": order.get(
            "meal_name",
            "Lunch + Dinner",
        ),
        "plan_type": order["plan_type"],
        "meal_mode": order["meal_mode"],
        "price": order["price"],
        "location": order.get("location"),
        "status": order["status"],
        "created_at": created_at,
        "start_date": start_date,
        "end_date": end_date,
    }


# =========================================================
# MESS OWNER → VIEW ORDERS
# =========================================================

@router.get(
    "/mess-orders",
    response_model=list[MessOrderResponseSchema],
)
def get_mess_orders(
    current_user=Depends(require_role("MESS_OWNER")),
):
    mess_collection = db["messes"]
    order_collection = db["orders"]
    users_collection = db["users"]

    mess = mess_collection.find_one(
        {
            "owner_id": str(current_user["_id"]),
        }
    )

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found",
        )

    mess_id = str(mess["_id"])

    orders = list(
        order_collection.find(
            {
                "mess_id": mess_id,
            }
        ).sort("created_at", -1)
    )

    result = []

    for order in orders:
        try:
            student = users_collection.find_one(
                {
                    "_id": ObjectId(order["student_id"]),
                }
            )
        except Exception:
            student = None

        if student:
            student_name = student.get(
                "name",
                "Student not found",
            )
            student_phone = student.get("phone", "")
        else:
            student_name = "Student not found"
            student_phone = ""

        created_at = order.get("created_at")

        if created_at:
            created_at = created_at.isoformat()
        else:
            created_at = ""

        start_date = order.get("start_date")

        if start_date:
            start_date = start_date.isoformat()
        else:
            start_date = None

        end_date = order.get("end_date")

        if end_date:
            end_date = end_date.isoformat()
        else:
            end_date = None

        result.append(
            {
                "order_id": str(order["_id"]),
                "student_id": order["student_id"],
                "student_name": student_name,
                "student_phone": student_phone,
                "day": order.get("day", ""),
                "meal_slot": order.get("meal_slot", ""),
                "meal_name": order.get(
                    "meal_name",
                    "Meal not found",
                ),
                "plan_type": order["plan_type"],
                "meal_mode": order["meal_mode"],
                "price": order["price"],
                "location": order.get("location"),
                "status": order["status"],
                "created_at": created_at,
                "start_date": start_date,
                "end_date": end_date,
            }
        )

    return result


# =========================================================
# MESS OWNER → UPDATE ORDER STATUS
# =========================================================

@router.put("/status/{order_id}")
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdateSchema,
    current_user=Depends(require_role("MESS_OWNER")),
):
    allowed_statuses = [
        "PENDING_PAYMENT",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
    ]

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Use PENDING_PAYMENT, ACTIVE, "
                "COMPLETED or CANCELLED."
            ),
        )

    mess_collection = db["messes"]
    order_collection = db["orders"]
    notification_collection = db["notifications"]

    # -----------------------------------------------------
    # Find mess owned by current user
    # -----------------------------------------------------

    mess = mess_collection.find_one(
        {
            "owner_id": str(current_user["_id"]),
        }
    )

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found",
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
            detail="Invalid order ID",
        )

    # -----------------------------------------------------
    # Find order
    # -----------------------------------------------------

    order = order_collection.find_one(
        {
            "_id": order_object_id,
            "mess_id": mess_id,
        }
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found for this mess",
        )

    # =====================================================
    # VALIDATE STATUS TRANSITION
    # =====================================================

    current_status = order.get("status")
    new_status = status_update.status

    # -----------------------------------------------------
    # Owner can ACCEPT only pending approval orders
    # -----------------------------------------------------

    if new_status == "PENDING_PAYMENT":
        if current_status != "PENDING_OWNER_APPROVAL":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only orders waiting for owner "
                    "approval can be accepted."
                ),
            )

    # -----------------------------------------------------
    # Owner can COMPLETE only active orders
    # -----------------------------------------------------

    if new_status == "COMPLETED":
        if current_status != "ACTIVE":
            raise HTTPException(
                status_code=400,
                detail="Only active orders can be completed.",
            )

    # -----------------------------------------------------
    # Owner can CANCEL pending or active orders
    # -----------------------------------------------------

    if new_status == "CANCELLED":
        if current_status not in [
            "PENDING_OWNER_APPROVAL",
            "PENDING_PAYMENT",
            "ACTIVE",
        ]:
            raise HTTPException(
                status_code=400,
                detail=(
                    "This order cannot be cancelled "
                    "at its current stage."
                ),
            )

    # =====================================================
    # UPDATE ORDER STATUS
    # =====================================================

    order_collection.update_one(
        {
            "_id": order_object_id,
            "mess_id": mess_id,
        },
        {
            "$set": {
                "status": new_status,
            }
        },
    )

    # =====================================================
    # NOTIFICATION → STUDENT
    # =====================================================

    student_id = order.get("student_id")

    if student_id:

        # -------------------------------------------------
        # OWNER ACCEPTED ORDER
        # -------------------------------------------------

        if new_status == "PENDING_PAYMENT":
            notification_document = create_notification_document(
                recipient_id=str(student_id),
                recipient_role="STUDENT",
                notification_type="ORDER_ACCEPTED",
                title="Order Accepted",
                message=(
                    "Your order has been accepted "
                    "by the mess owner. "
                    "Please complete your payment."
                ),
                order_id=order_id,
            )

            notification_collection.insert_one(
                notification_document
            )

        # -------------------------------------------------
        # OWNER CANCELLED ORDER
        # -------------------------------------------------

        elif new_status == "CANCELLED":
            notification_document = create_notification_document(
                recipient_id=str(student_id),
                recipient_role="STUDENT",
                notification_type="ORDER_CANCELLED",
                title="Order Cancelled",
                message=(
                    "Your order has been cancelled "
                    "by the mess owner."
                ),
                order_id=order_id,
            )

            notification_collection.insert_one(
                notification_document
            )

        # -------------------------------------------------
        # OWNER COMPLETED ORDER
        # -------------------------------------------------

        elif new_status == "COMPLETED":
            notification_document = create_notification_document(
                recipient_id=str(student_id),
                recipient_role="STUDENT",
                notification_type="ORDER_COMPLETED",
                title="Order Completed",
                message=(
                    "Your order has been completed "
                    "by the mess owner."
                ),
                order_id=order_id,
            )

            notification_collection.insert_one(
                notification_document
            )

    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {
        "message": "Order status updated successfully",
        "order_id": order_id,
        "status": new_status,
    }
