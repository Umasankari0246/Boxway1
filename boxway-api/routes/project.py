from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.project import ProjectSchema, UpdateProjectSchema, project_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
project_collection = db.get_collection("projects")

@router.post("/", response_description="Project added into the database")
async def add_project(project: ProjectSchema = Body(...)):
    project_dict = jsonable_encoder(project)
    
    # Add timestamps
    project_dict["createdAt"] = datetime.utcnow().isoformat()
    project_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Generate projectId if not provided
    if not project_dict.get("projectId"):
        project_dict["projectId"] = f"PRJ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Set default phase and totalPhases if not provided
    if not project_dict.get("phase"):
        project_dict["phase"] = 1
    # Calculate totalPhases from type
    PROJECT_PHASE_COUNTS = {
        "Commercial": 10,
        "Residential": 11,
        "Hospitality": 10,
        "Municipal": 10,
        "High-End Residential": 11,
        "Cultural / Institutional": 10,
        "Renovation / Restoration": 10,
        "Commercial / Retail": 10,
        "Hospitality / Boutique Hotel": 10,
    }
    if not project_dict.get("totalPhases"):
        project_dict["totalPhases"] = PROJECT_PHASE_COUNTS.get(project_dict.get("type"), 8)
    
    new_project = project_collection.insert_one(project_dict)
    created_project = project_collection.find_one({"_id": new_project.inserted_id})
    return {"message": "Success", "data": project_helper(created_project)}

@router.get("/", response_description="Retrieve all projects")
async def get_projects():
    projects = project_collection.find()
    return {"message": "Success", "data": [project_helper(proj) for proj in projects]}

@router.get("/{id}", response_description="Retrieve a single project")
async def get_project(id: str):
    project = project_collection.find_one({"_id": ObjectId(id)})
    if project:
        return {"message": "Success", "data": project_helper(project)}
    return {"message": "Project not found"}, 404

@router.put("/{id}", response_description="Update a project")
async def update_project(id: str, req: UpdateProjectSchema = Body(...)):
    project = project_collection.find_one({"_id": ObjectId(id)})
    if project:
        updated_project = project_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": jsonable_encoder(req)}
        )
        if updated_project:
            return {"message": "Success"}
    return {"message": "Project not found"}, 404

@router.patch("/{id}", response_description="Partially update a project")
async def patch_project(id: str, req: dict = Body(...)):
    project = project_collection.find_one({"_id": ObjectId(id)})
    if project:
        req["updatedAt"] = datetime.utcnow().isoformat()
        updated_project = project_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": req}
        )
        if updated_project:
            updated_proj = project_collection.find_one({"_id": ObjectId(id)})
            return {"message": "Success", "data": project_helper(updated_proj)}
    return {"message": "Project not found"}, 404

@router.delete("/{id}", response_description="Delete a project")
async def delete_project(id: str):
    project = project_collection.find_one({"_id": ObjectId(id)})
    if project:
        project_collection.delete_one({"_id": ObjectId(id)})
        return {"message": "Success"}
    return {"message": "Project not found"}, 404

@router.get("/{id}/activity", response_description="Get project activity/comments")
async def get_project_activity(id: str):
    project = project_collection.find_one({"_id": ObjectId(id)})
    if project:
        activity = project.get("activity", [])
        return {"message": "Success", "data": activity}
    return {"message": "Project not found"}, 404
