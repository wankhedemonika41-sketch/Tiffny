from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)

from bson import ObjectId

from auth.auth_roles import require_role

from schemas.mess_schema import (
    MessRegistrationSchema,
    MessProfileSchema,
    MessUpdateSchema,
    PublicMessSchema
)

from schemas.menu_schema import (
    MenuCreateSchema,
    MenuUpdateSchema,
    MenuResponseSchema
)

from schemas.capacity_schema import CapacityUpdateSchema
from schemas.monthly_price_schema import MonthlyPriceUpdateSchema
from schemas.one_time_price_schema import OneTimePriceUpdateSchema

from models.mess_model import create_mess_document
from models.menu_model import create_menu_document

from database import messes_collection, db


router = APIRouter(
    prefix="/mess",
    tags=["Mess"]
)


# =========================================================
# UPLOAD SETTINGS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads" / "messes"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# HELPER FUNCTION - SAVE UPLOADED FILE
# =========================================================

async def save_uploaded_file(
    uploaded_file: UploadFile,
    owner_id: str,
    folder_name: str,
    allowed_types: list[str]
):

    if uploaded_file is None:
        return None

    # Check file type
    if uploaded_file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid file type for {folder_name}. "
                f"Allowed types: {', '.join(allowed_types)}"
            )
        )

    # Read file
    file_content = await uploaded_file.read()

    # Maximum file size = 5 MB
    max_file_size = 5 * 1024 * 1024

    if len(file_content) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"{folder_name} file must be less than 5 MB."
        )

    # Create owner-specific folder
    owner_folder = UPLOAD_DIR / owner_id

    owner_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    # Get original extension
    original_filename = uploaded_file.filename or ""

    file_extension = Path(
        original_filename
    ).suffix.lower()

    # Create unique filename
    unique_filename = (
        f"{folder_name.lower()}_{uuid4().hex}"
        f"{file_extension}"
    )

    file_path = owner_folder / unique_filename

    # Save file
    with open(file_path, "wb") as file:
        file.write(file_content)

    # Return URL path
    return (
        f"/uploads/messes/"
        f"{owner_id}/"
        f"{unique_filename}"
    )


# =========================================================
# MESS REGISTRATION
# =========================================================

@router.post("/register")
def register_mess(
    mess: MessRegistrationSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    # Check if owner already has a mess
    existing_mess = messes_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if existing_mess:
        return {
            "message": "Mess profile already exists",
            "mess_id": str(existing_mess["_id"]),
            "status": existing_mess.get(
                "status",
                "PENDING"
            )
        }

    mess_document = create_mess_document(
        owner_id=str(current_user["_id"]),
        mess_name=mess.mess_name,
        description=mess.description,
        phone=mess.phone,
        address=mess.address,
        location=mess.location,
        photo=mess.photo,
        verification_proof=mess.verification_proof
    )

    result = messes_collection.insert_one(
        mess_document
    )

    return {
        "message": (
            "Mess registered successfully. "
            "Waiting for admin approval."
        ),
        "mess_id": str(result.inserted_id),
        "status": "PENDING"
    }


# =========================================================
# SUBMIT MESS PROFILE WITH FILE UPLOADS
# =========================================================

@router.post("/profile/submit")
async def submit_mess_profile(
    mess_name: str = Form(...),
    description: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    location: str = Form(...),

    mess_image: UploadFile = File(...),

    verification_proof: UploadFile = File(...),

    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    owner_id = str(current_user["_id"])

    # -----------------------------------------------------
    # CHECK EXISTING MESS
    # -----------------------------------------------------

    existing_mess = messes_collection.find_one({
        "owner_id": owner_id
    })

    if existing_mess:
        raise HTTPException(
            status_code=400,
            detail="Mess profile already exists."
        )

    # -----------------------------------------------------
    # SAVE MESS IMAGE
    # -----------------------------------------------------

    mess_image_path = await save_uploaded_file(
        uploaded_file=mess_image,
        owner_id=owner_id,
        folder_name="mess_image",
        allowed_types=[
            "image/jpeg",
            "image/png",
            "image/webp"
        ]
    )

    # -----------------------------------------------------
    # SAVE VERIFICATION PROOF
    # -----------------------------------------------------

    verification_proof_path = await save_uploaded_file(
        uploaded_file=verification_proof,
        owner_id=owner_id,
        folder_name="verification_proof",
        allowed_types=[
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ]
    )

    # -----------------------------------------------------
    # CREATE MESS DOCUMENT
    # -----------------------------------------------------

    mess_document = create_mess_document(
        owner_id=owner_id,
        mess_name=mess_name,
        description=description,
        phone=phone,
        address=address,
        location=location,
        photo=mess_image_path,
        verification_proof=verification_proof_path
    )

    # -----------------------------------------------------
    # INSERT INTO MONGODB
    # -----------------------------------------------------

    result = messes_collection.insert_one(
        mess_document
    )

    return {
        "message": (
            "Mess profile submitted successfully. "
            "Waiting for admin approval."
        ),
        "mess_id": str(result.inserted_id),
        "status": "PENDING",
        "photo": mess_image_path,
        "verification_proof": verification_proof_path
    }


# =========================================================
# PUBLIC - GET ALL APPROVED MESSES
# =========================================================

@router.get(
    "/approved",
    response_model=list[PublicMessSchema]
)
def get_approved_messes():

    approved_messes = list(
        messes_collection.find({
            "status": "APPROVED"
        }).sort(
            "created_at",
            -1
        )
    )

    result = []

    for mess in approved_messes:

        result.append({
            "mess_id": str(mess["_id"]),
            "mess_name": mess["mess_name"],
            "description": mess["description"],
            "phone": mess["phone"],
            "address": mess["address"],
            "location": mess["location"],
            "photo": mess.get("photo"),
            "rating": mess.get(
                "rating",
                0
            ),
            "total_reviews": mess.get(
                "total_reviews",
                0
            ),
            "max_capacity": mess.get(
                "max_capacity"
            ),
            "monthly_price": mess.get(
                "monthly_price"
            ),
            "one_time_price": mess.get(
                "one_time_price"
            )
        })

    return result


# =========================================================
# PUBLIC - GET ONE APPROVED MESS DETAILS
# =========================================================

@router.get("/public/{mess_id}")
def get_public_mess_details(
    mess_id: str
):

    # -----------------------------------------------------
    # VALIDATE MESS ID
    # -----------------------------------------------------

    try:
        mess_object_id = ObjectId(mess_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid mess ID"
        )

    # -----------------------------------------------------
    # FIND ONLY APPROVED MESS
    # -----------------------------------------------------

    mess = messes_collection.find_one({
        "_id": mess_object_id,
        "status": "APPROVED"
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Approved mess not found"
        )

    # -----------------------------------------------------
    # GET WEEKLY MENU
    # -----------------------------------------------------

    menu_collection = db["menus"]

    menu_items = list(
        menu_collection.find({
            "mess_id": str(mess["_id"])
        })
    )

    menu_result = []

    for item in menu_items:

        menu_result.append({
            "menu_id": str(item["_id"]),
            "mess_id": item.get(
                "mess_id"
            ),
            "day": item.get(
                "day"
            ),
            "lunch": item.get(
                "lunch"
            ),
            "dinner": item.get(
                "dinner"
            ),
            "holiday": item.get(
                "holiday",
                False
            )
        })

    # -----------------------------------------------------
    # RETURN PUBLIC DETAILS
    # -----------------------------------------------------

    return {
        "mess_id": str(mess["_id"]),
        "mess_name": mess.get(
            "mess_name"
        ),
        "description": mess.get(
            "description"
        ),
        "phone": mess.get(
            "phone"
        ),
        "address": mess.get(
            "address"
        ),
        "location": mess.get(
            "location"
        ),
        "photo": mess.get(
            "photo"
        ),
        "rating": mess.get(
            "rating",
            0
        ),
        "total_reviews": mess.get(
            "total_reviews",
            0
        ),
        "max_capacity": mess.get(
            "max_capacity"
        ),
        "monthly_price": mess.get(
            "monthly_price"
        ),
        "one_time_price": mess.get(
            "one_time_price"
        ),
        "menu": menu_result
    }


# =========================================================
# VIEW OWN MESS PROFILE
# =========================================================

@router.get(
    "/profile",
    response_model=MessProfileSchema
)
def get_mess_profile(
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    mess = messes_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found"
        )

    return {
        "mess_id": str(mess["_id"]),
        "owner_id": mess["owner_id"],
        "mess_name": mess["mess_name"],
        "description": mess["description"],
        "phone": mess["phone"],
        "address": mess["address"],
        "location": mess["location"],
        "photo": mess.get(
            "photo"
        ),
        "verification_proof": mess.get(
            "verification_proof"
        ),
        "status": mess.get(
            "status",
            "PENDING"
        ),
        "rating": mess.get(
            "rating",
            0
        ),
        "total_reviews": mess.get(
            "total_reviews",
            0
        ),
        "max_capacity": mess.get(
            "max_capacity"
        ),
        "monthly_price": mess.get(
            "monthly_price"
        ),
        "one_time_price": mess.get(
            "one_time_price"
        )
    }


# =========================================================
# UPDATE OWN MESS PROFILE
# =========================================================

@router.put("/profile")
def update_mess_profile(
    mess: MessUpdateSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    result = messes_collection.update_one(
        {
            "owner_id": str(current_user["_id"])
        },
        {
            "$set": {
                "mess_name": mess.mess_name,
                "description": mess.description,
                "phone": mess.phone,
                "address": mess.address,
                "location": mess.location,
                "photo": mess.photo,
                "verification_proof": (
                    mess.verification_proof
                )
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Mess profile not found"
        }

    return {
        "message": (
            "Mess profile updated successfully"
        )
    }


# =========================================================
# UPLOAD NEW MESS IMAGE
# =========================================================

@router.post("/upload-photo")
async def upload_mess_photo(
    file: UploadFile = File(...),
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    owner_id = str(current_user["_id"])

    photo_path = await save_uploaded_file(
        uploaded_file=file,
        owner_id=owner_id,
        folder_name="mess_image",
        allowed_types=[
            "image/jpeg",
            "image/png",
            "image/webp"
        ]
    )

    return {
        "message": "Image uploaded successfully",
        "photo": photo_path
    }


# =========================================================
# UPDATE MESS CAPACITY
# =========================================================

@router.put("/capacity")
def update_mess_capacity(
    capacity: CapacityUpdateSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    result = messes_collection.update_one(
        {
            "owner_id": str(current_user["_id"])
        },
        {
            "$set": {
                "max_capacity": (
                    capacity.max_capacity
                )
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Mess profile not found"
        }

    return {
        "message": (
            "Mess capacity updated successfully"
        ),
        "max_capacity": capacity.max_capacity
    }


# =========================================================
# UPDATE MONTHLY PRICE
# =========================================================

@router.put("/monthly-price")
def update_monthly_price(
    monthly_price: MonthlyPriceUpdateSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    result = messes_collection.update_one(
        {
            "owner_id": str(current_user["_id"])
        },
        {
            "$set": {
                "monthly_price": (
                    monthly_price.monthly_price
                )
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Mess profile not found"
        }

    return {
        "message": (
            "Monthly price updated successfully"
        ),
        "monthly_price": (
            monthly_price.monthly_price
        )
    }


# =========================================================
# UPDATE ONE-TIME PRICE
# =========================================================

@router.put("/one-time-price")
def update_one_time_price(
    one_time_price: OneTimePriceUpdateSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    result = messes_collection.update_one(
        {
            "owner_id": str(current_user["_id"])
        },
        {
            "$set": {
                "one_time_price": (
                    one_time_price.one_time_price
                )
            }
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Mess profile not found"
        }

    return {
        "message": (
            "One-time price updated successfully"
        ),
        "one_time_price": (
            one_time_price.one_time_price
        )
    }


# =========================================================
# ADD DAILY MENU
# =========================================================

@router.post("/menu")
def add_menu_item(
    menu: MenuCreateSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    # Find the mess owned by the logged-in owner
    mess = messes_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found"
        )

    menu_collection = db["menus"]

    # Normalize day
    day = menu.day.strip().upper()

    allowed_days = {
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
    }

    if day not in allowed_days:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid day. "
                "Use Monday to Sunday."
            )
        )

    # Check if this day already exists
    existing_menu = menu_collection.find_one({
        "mess_id": str(mess["_id"]),
        "day": day
    })

    if existing_menu:
        raise HTTPException(
            status_code=400,
            detail=f"{day} menu already exists."
        )

    # Create menu document
    menu_document = create_menu_document(
        mess_id=str(mess["_id"]),
        day=day,
        lunch=(
            menu.lunch.model_dump()
            if menu.lunch
            else None
        ),
        dinner=(
            menu.dinner.model_dump()
            if menu.dinner
            else None
        ),
        holiday=menu.holiday
    )

    # Insert menu
    result = menu_collection.insert_one(
        menu_document
    )

    return {
        "message": (
            "Daily menu added successfully"
        ),
        "menu_id": str(result.inserted_id),
        "mess_id": str(mess["_id"]),
        "day": day
    }


# =========================================================
# VIEW OWN WEEKLY MENU
# =========================================================

# =========================================================
# VIEW OWN WEEKLY MENU
# =========================================================

@router.get(
    "/menu",
    response_model=list[MenuResponseSchema]
)
def get_menu(
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    # Find the mess owned by logged-in owner
    mess = messes_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        return []

    menu_collection = db["menus"]

    # Find only new weekly menu records
    menu_items = list(
        menu_collection.find({
            "mess_id": str(mess["_id"]),
            "day": {
                "$exists": True
            }
        })
    )

    day_order = {
        "MONDAY": 1,
        "TUESDAY": 2,
        "WEDNESDAY": 3,
        "THURSDAY": 4,
        "FRIDAY": 5,
        "SATURDAY": 6,
        "SUNDAY": 7
    }

    # Sort Monday -> Sunday
    menu_items.sort(
        key=lambda item: day_order.get(
            item.get("day", ""),
            99
        )
    )

    result = []

    for item in menu_items:

        result.append({
            "menu_id": str(item["_id"]),
            "mess_id": item.get(
                "mess_id"
            ),
            "day": item.get(
                "day"
            ),
            "lunch": item.get(
                "lunch"
            ),
            "dinner": item.get(
                "dinner"
            ),
            "holiday": item.get(
                "holiday",
                False
            )
        })

    return result


# =========================================================
# UPDATE DAILY MENU
# =========================================================

@router.put("/menu/{menu_id}")
def update_menu_item(
    menu_id: str,
    menu: MenuUpdateSchema,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    # Find owner's mess
    mess = messes_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found"
        )

    menu_collection = db["menus"]

    # Validate menu ID
    try:
        menu_object_id = ObjectId(menu_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid menu ID"
        )

    # Normalize day
    day = menu.day.strip().upper()

    allowed_days = {
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
    }

    if day not in allowed_days:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid day. "
                "Use Monday to Sunday."
            )
        )

    # Check whether another menu already uses this day
    existing_menu = menu_collection.find_one({
        "mess_id": str(mess["_id"]),
        "day": day,
        "_id": {
            "$ne": menu_object_id
        }
    })

    if existing_menu:
        raise HTTPException(
            status_code=400,
            detail=f"{day} menu already exists."
        )

    # Update only owner's menu
    result = menu_collection.update_one(
        {
            "_id": menu_object_id,
            "mess_id": str(mess["_id"])
        },
        {
            "$set": {
                "day": day,
                "lunch": (
                    menu.lunch.model_dump()
                    if menu.lunch
                    else None
                ),
                "dinner": (
                    menu.dinner.model_dump()
                    if menu.dinner
                    else None
                ),
                "holiday": menu.holiday
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Menu not found"
        )

    return {
        "message": "Daily menu updated successfully",
        "menu_id": menu_id,
        "day": day
    }


# =========================================================
# DELETE DAILY MENU
# =========================================================

@router.delete("/menu/{menu_id}")
def delete_menu_item(
    menu_id: str,
    current_user=Depends(
        require_role("MESS_OWNER")
    )
):

    # Find owner's mess
    mess = messes_collection.find_one({
        "owner_id": str(current_user["_id"])
    })

    if mess is None:
        raise HTTPException(
            status_code=404,
            detail="Mess profile not found"
        )

    menu_collection = db["menus"]

    # Validate menu ID
    try:
        menu_object_id = ObjectId(menu_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid menu ID"
        )

    # Delete only owner's menu
    result = menu_collection.delete_one(
        {
            "_id": menu_object_id,
            "mess_id": str(mess["_id"])
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Menu not found"
        )

    return {
        "message": "Daily menu deleted successfully",
        "menu_id": menu_id
    }