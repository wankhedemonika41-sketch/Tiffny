from database import users_collection
from models.user_model import create_user_document
from auth.auth_utils import hash_password


ADMIN_NAME = "Rohit Patil"
ADMIN_EMAIL = "rohit9328@gmail.com"

# Enter your project-only admin password here.
ADMIN_PASSWORD = "rohit@9328"


existing_admin = users_collection.find_one({
    "email": ADMIN_EMAIL
})

if existing_admin:
    print("Admin account already exists.")
else:
    hashed_password = hash_password(ADMIN_PASSWORD)

    admin_document = create_user_document(
        name=ADMIN_NAME,
        email=ADMIN_EMAIL,
        phone="",
        password=hashed_password,
        role="ADMIN",
        location=""
    )

    result = users_collection.insert_one(admin_document)

    print("Admin account created successfully.")
    print("Admin ID:", result.inserted_id)