import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient


# Load .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


# Get MongoDB connection string
MONGODB_URI = os.getenv("MONGODB_URI")


if not MONGODB_URI:
    raise ValueError("MONGODB_URI is not found in .env")


# Connect to MongoDB
client = MongoClient(MONGODB_URI)


# Select database
db = client["tiffny_db"]


# Collections
users_collection = db["users"]
messes_collection = db["messes"]
orders_collection = db["orders"]
payments_collection = db["payments"]