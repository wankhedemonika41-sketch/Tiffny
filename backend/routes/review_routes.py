from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth.auth_roles import require_role

from schemas.review_schema import (
    ReviewCreateSchema,
    ReviewResponseSchema
)

from models.review_model import create_review_document

from database import db


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


# =========================================================
# CREATE REVIEW
# =========================================================

@router.post(
    "/{order_id}",
    response_model=ReviewResponseSchema
)
def create_review(
    order_id: str,
    review_data: ReviewCreateSchema,
    current_user=Depends(require_role("STUDENT"))
):

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    order_collection = db["orders"]
    review_collection = db["reviews"]
    mess_collection = db["messes"]

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
    # Find student's order
    # -----------------------------------------------------

    order = order_collection.find_one({
        "_id": order_object_id,
        "student_id": str(current_user["_id"])
    })

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # -----------------------------------------------------
    # Review only completed orders
    # -----------------------------------------------------

    if order["status"] != "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="You can review an order only after it is completed"
        )

    # -----------------------------------------------------
    # Check whether review already exists
    # -----------------------------------------------------

    existing_review = review_collection.find_one({
        "order_id": order_id
    })

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="This order has already been reviewed"
        )

    # -----------------------------------------------------
    # Get mess
    # -----------------------------------------------------

    try:
        mess_object_id = ObjectId(order["mess_id"])

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid mess ID"
        )

    mess = mess_collection.find_one({
        "_id": mess_object_id
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess not found"
        )

    # -----------------------------------------------------
    # Create review document
    # -----------------------------------------------------

    review_document = create_review_document(
        order_id=order_id,
        student_id=str(current_user["_id"]),
        mess_id=order["mess_id"],
        rating=review_data.rating,
        review=review_data.review
    )

    # -----------------------------------------------------
    # Save review
    # -----------------------------------------------------

    result = review_collection.insert_one(
        review_document
    )

    # -----------------------------------------------------
    # Calculate new mess rating
    # -----------------------------------------------------

    reviews = list(
        review_collection.find({
            "mess_id": order["mess_id"]
        })
    )

    total_reviews = len(reviews)

    total_rating = sum(
        item["rating"]
        for item in reviews
    )

    average_rating = (
        total_rating / total_reviews
        if total_reviews > 0
        else 0
    )

    # -----------------------------------------------------
    # Update mess rating
    # -----------------------------------------------------

    mess_collection.update_one(
        {
            "_id": mess_object_id
        },
        {
            "$set": {
                "rating": round(average_rating, 1),
                "total_reviews": total_reviews
            }
        }
    )

    # -----------------------------------------------------
    # Return review
    # -----------------------------------------------------

    return {
        "review_id": str(result.inserted_id),
        "order_id": order_id,
        "student_id": str(current_user["_id"]),
        "mess_id": order["mess_id"],
        "rating": review_data.rating,
        "review": review_data.review,
        "created_at": review_document["created_at"].isoformat()
    }


# =========================================================
# GET REVIEWS FOR A MESS
# =========================================================

@router.get(
    "/mess/{mess_id}",
    response_model=list[ReviewResponseSchema]
)
def get_mess_reviews(
    mess_id: str,
    current_user=Depends(require_role("STUDENT"))
):

    # -----------------------------------------------------
    # Get collections
    # -----------------------------------------------------

    review_collection = db["reviews"]
    mess_collection = db["messes"]

    # -----------------------------------------------------
    # Validate mess ID
    # -----------------------------------------------------

    try:
        mess_object_id = ObjectId(mess_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid mess ID"
        )

    # -----------------------------------------------------
    # Check mess exists
    # -----------------------------------------------------

    mess = mess_collection.find_one({
        "_id": mess_object_id
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess not found"
        )

    # -----------------------------------------------------
    # Get reviews
    # -----------------------------------------------------

    reviews = list(
        review_collection.find({
            "mess_id": mess_id
        }).sort("created_at", -1)
    )

    result = []

    # -----------------------------------------------------
    # Prepare reviews
    # -----------------------------------------------------

    for review in reviews:

        created_at = review.get("created_at")

        if created_at:
            created_at = created_at.isoformat()
        else:
            created_at = ""

        result.append({
            "review_id": str(review["_id"]),
            "order_id": review["order_id"],
            "student_id": review["student_id"],
            "mess_id": review["mess_id"],
            "rating": review["rating"],
            "review": review["review"],
            "created_at": created_at
        })

    return result