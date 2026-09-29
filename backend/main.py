from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import client, db

from routes.auth_routes import router as auth_router
from routes.student_routes import router as student_router
from routes.mess_routes import router as mess_router
from routes.admin_routes import router as admin_router
from routes.order_routes import router as order_router
from routes.payment_routes import router as payment_router
from routes.review_routes import router as review_router


app = FastAPI(title="Tiffny API")


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(exist_ok=True)


# =========================================================
# SERVE UPLOADED FILES
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# AUTHENTICATION ROUTES
# =========================================================

app.include_router(auth_router)


# =========================================================
# STUDENT ROUTES
# =========================================================

app.include_router(student_router)


# =========================================================
# MESS OWNER ROUTES
# =========================================================

app.include_router(mess_router)


# =========================================================
# ADMIN ROUTES
# =========================================================

app.include_router(admin_router)


# =========================================================
# ORDER ROUTES
# =========================================================

app.include_router(order_router)


# =========================================================
# PAYMENT ROUTES
# =========================================================

app.include_router(payment_router)


# =========================================================
# REVIEW ROUTES
# =========================================================

app.include_router(review_router)


# =========================================================
# ROOT ROUTE
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to Tiffny API"
    }


# =========================================================
# DATABASE TEST ROUTE
# =========================================================

@app.get("/test-db")
def test_db():
    client.admin.command("ping")

    return {
        "message": "MongoDB connected successfully!"
    }