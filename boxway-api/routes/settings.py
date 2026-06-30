from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.settings import SettingsSchema, UpdateSettingsSchema, settings_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
settings_collection = db.get_collection("settings")

@router.post("/", response_description="Settings added into the database")
async def add_settings(settings: SettingsSchema = Body(...)):
    settings_dict = jsonable_encoder(settings)
    
    # Add timestamps
    settings_dict["createdAt"] = datetime.utcnow().isoformat()
    settings_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    new_settings = settings_collection.insert_one(settings_dict)
    created_settings = settings_collection.find_one({"_id": new_settings.inserted_id})
    return {"message": "Success", "data": settings_helper(created_settings)}

@router.get("/", response_description="Settings retrieved")
async def get_settings():
    settings = settings_collection.find_one()
    if settings:
        return {"message": "Success", "data": settings_helper(settings)}
    
    # Return default settings if none exist
    default_settings = {
        "companyProfile": {
            "companyName": "Boxway Architecture Studio",
            "tagline": "Design. Build. Inspire.",
            "businessEmail": "hello@boxway.studio",
            "phone": "+1 (555) 000-1234",
            "headquarters": "New York, NY",
            "website": "https://boxway.studio",
            "address": "123 Architecture Ave, New York, NY 10001",
            "industry": "Architecture & Design",
            "foundedYear": 2024,
            "teamSize": 15
        },
        "users": [
            {
                "name": "Alex Carter",
                "email": "alex@boxway.studio",
                "role": "Admin",
                "status": "Active",
                "joinedDate": "2024-01-15",
                "lastActive": datetime.utcnow().isoformat()
            }
        ],
        "integrations": [
            {
                "name": "AutoCAD",
                "description": "Sync your AutoCAD drawings and CAD files with Boxway projects",
                "status": "Disconnected",
                "icon": "📐",
                "lastSync": None
            },
            {
                "name": "SketchUp",
                "description": "Import 3D models and architectural designs from SketchUp",
                "status": "Disconnected",
                "icon": "🏗️",
                "lastSync": None
            },
            {
                "name": "Revit",
                "description": "Connect BIM models and building information data",
                "status": "Disconnected",
                "icon": "🏢",
                "lastSync": None
            },
            {
                "name": "Google Workspace",
                "description": "Connect your Google account for email and calendar sync",
                "status": "Disconnected",
                "icon": "🔗",
                "lastSync": None
            },
            {
                "name": "Slack",
                "description": "Send project updates and team notifications to your Slack workspace",
                "status": "Disconnected",
                "icon": "�",
                "lastSync": None
            },
            {
                "name": "QuickBooks",
                "description": "Sync accounting data and project finances with QuickBooks Online",
                "status": "Disconnected",
                "icon": "📊",
                "lastSync": None
            },
            {
                "name": "Dropbox",
                "description": "Store and share project files and documents securely",
                "status": "Disconnected",
                "icon": "📁",
                "lastSync": None
            }
        ],
        "billing": {
            "plan": "Professional",
            "price": "$299/month",
            "nextBillingDate": None,
            "status": "Active",
            "invoices": [],
            "features": ["Unlimited Projects", "CAD File Storage (100GB)", "Team Collaboration Tools", "Client Portal", "Project Analytics", "Invoice Generation", "Payroll Management", "Priority Support"]
        },
        "notifications": [
            {"type": "Email Notifications", "enabled": True, "email": True, "inApp": True},
            {"type": "Project Updates", "enabled": True, "email": True, "inApp": True},
            {"type": "Invoice Alerts", "enabled": True, "email": True, "inApp": False},
            {"type": "Payroll Reminders", "enabled": True, "email": True, "inApp": True},
            {"type": "System Updates", "enabled": True, "email": False, "inApp": True}
        ],
        "appearance": {
            "theme": "Light",
            "language": "English",
            "dateFormat": "MM/DD/YYYY",
            "currency": "USD ($)",
            "fontSize": "Medium"
        },
        "security": {
            "twoFactorEnabled": False,
            "sessionTimeout": 30,
            "passwordMinLength": 8,
            "requireStrongPassword": True
        },
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    return {"message": "Success", "data": default_settings}

@router.put("/")
@router.patch("/")
async def update_settings(req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    
    # Add updated timestamp
    req["updatedAt"] = datetime.utcnow().isoformat()
    
    settings = settings_collection.find_one()
    if settings:
        update_result = settings_collection.update_one({"_id": settings["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_settings = settings_collection.find_one({"_id": settings["_id"]})
            return {"message": "Success", "data": settings_helper(updated_settings)}
    else:
        # Create settings if they don't exist
        req["createdAt"] = datetime.utcnow().isoformat()
        new_settings = settings_collection.insert_one(req)
        created_settings = settings_collection.find_one({"_id": new_settings.inserted_id})
        return {"message": "Success", "data": settings_helper(created_settings)}
    
    return {"error": "Update failed"}
