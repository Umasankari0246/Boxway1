from fastapi import APIRouter, Body, HTTPException
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.user import UserSchema, UpdateUserSchema, LoginSchema, user_helper
from bson.objectid import ObjectId
from datetime import datetime
from passlib.context import CryptContext

router = APIRouter()
db = get_database()
user_collection = db.get_collection("users")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register", response_description="User registered")
async def register_user(user: UserSchema = Body(...)):
    user_dict = jsonable_encoder(user)
    
    # Check if email already exists
    existing_user = user_collection.find_one({"email": user_dict["email"]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    user_dict["password"] = get_password_hash(user_dict["password"])
    
    # Add timestamps
    user_dict["createdAt"] = datetime.utcnow().isoformat()
    user_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Generate userId if not provided
    if not user_dict.get("userId"):
        user_dict["userId"] = f"USR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    new_user = user_collection.insert_one(user_dict)
    created_user = user_collection.find_one({"_id": new_user.inserted_id})
    
    # Return user without password
    user_data = user_helper(created_user)
    return {"message": "Success", "data": user_data}

@router.post("/login", response_description="User logged in")
async def login_user(login_data: LoginSchema = Body(...)):
    # Find user by email
    user = user_collection.find_one({"email": login_data.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password (try bcrypt first, then plain text for demo compatibility)
    try:
        if not verify_password(login_data.password, user["password"]):
            # Try plain text comparison for demo users
            if login_data.password != user["password"]:
                raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        # If bcrypt fails, try plain text
        if login_data.password != user["password"]:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Return user without password
    user_data = user_helper(user)
    return {"message": "Success", "data": user_data}

@router.get("/users", response_description="Users retrieved")
async def get_users():
    users = []
    for user in user_collection.find():
        users.append(user_helper(user))
    return {"message": "Success", "data": users}

@router.get("/users/{id}", response_description="User data retrieved")
async def get_user(id: str):
    # Try to find by userId first, then by MongoDB _id
    user = user_collection.find_one({"userId": id})
    if not user:
        try:
            user = user_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if user:
        return {"message": "Success", "data": user_helper(user)}
    return {"error": "User not found"}

@router.put("/users/{id}")
@router.patch("/users/{id}")
async def update_user(id: str, req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    
    # Hash password if provided
    if "password" in req:
        req["password"] = get_password_hash(req["password"])
    
    # Add updated timestamp
    req["updatedAt"] = datetime.utcnow().isoformat()
    
    # Try to find by userId first, then by MongoDB _id
    user = user_collection.find_one({"userId": id})
    if not user:
        try:
            user = user_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if user:
        update_result = user_collection.update_one({"_id": user["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_user = user_collection.find_one({"_id": user["_id"]})
            return {"message": "Success", "data": user_helper(updated_user)}
    return {"error": "Update failed"}

@router.delete("/users/{id}", response_description="User deleted")
async def delete_user(id: str):
    # Try to find by userId first, then by MongoDB _id
    user = user_collection.find_one({"userId": id})
    if not user:
        try:
            user = user_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if user:
        delete_result = user_collection.delete_one({"_id": user["_id"]})
        if delete_result.deleted_count == 1:
            return {"message": "Success"}
    return {"error": "Delete failed"}
