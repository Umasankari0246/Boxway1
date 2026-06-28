from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.client import ClientSchema, UpdateClientSchema, client_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
client_collection = db.get_collection("clients")

@router.post("/", response_description="Client added into the database")
async def add_client(client: ClientSchema = Body(...)):
    client_dict = jsonable_encoder(client)
    
    # Add timestamps
    client_dict["createdAt"] = datetime.utcnow().isoformat()
    client_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Generate clientId if not provided
    if not client_dict.get("clientId"):
        client_dict["clientId"] = f"CLI-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    new_client = client_collection.insert_one(client_dict)
    created_client = client_collection.find_one({"_id": new_client.inserted_id})
    return {"message": "Success", "data": client_helper(created_client)}

@router.get("/", response_description="Clients retrieved")
async def get_clients():
    clients = []
    project_collection = db.get_collection("projects")
    for client in client_collection.find():
        client_data = client_helper(client)
        # Calculate total projects and value from actual projects
        client_id = client_data.get("id") or client_data.get("clientId")
        client_name = client_data.get("name")
        
        # Count projects linked to this client
        project_count = project_collection.count_documents({
            "$or": [
                {"client": client_id},
                {"client": client_data.get("clientId")},
                {"client": str(client.get("_id"))},
                {"client": client_name}
            ]
        })
        
        # Calculate total value from projects
        projects = list(project_collection.find({
            "$or": [
                {"client": client_id},
                {"client": client_data.get("clientId")},
                {"client": str(client.get("_id"))},
                {"client": client_name}
            ]
        }))
        total_value = sum(p.get("budget", 0) for p in projects)
        
        client_data["totalProjects"] = project_count
        client_data["totalValue"] = total_value
        clients.append(client_data)
    return {"message": "Success", "data": clients}

@router.get("/{id}", response_description="Client data retrieved")
async def get_client(id: str):
    # Try to find by clientId first, then by MongoDB _id
    client = client_collection.find_one({"clientId": id})
    if not client:
        try:
            client = client_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if client:
        return {"message": "Success", "data": client_helper(client)}
    return {"error": "Client not found"}

@router.put("/{id}")
@router.patch("/{id}")
async def update_client(id: str, req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    
    # Add updated timestamp
    req["updatedAt"] = datetime.utcnow().isoformat()
    
    # Try to find by clientId first, then by MongoDB _id
    client = client_collection.find_one({"clientId": id})
    if not client:
        try:
            client = client_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if client:
        update_result = client_collection.update_one({"_id": client["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_client = client_collection.find_one({"_id": client["_id"]})
            return {"message": "Success", "data": client_helper(updated_client)}
    return {"error": "Update failed"}

@router.delete("/{id}", response_description="Client deleted")
async def delete_client(id: str):
    # Try to find by clientId first, then by MongoDB _id
    client = client_collection.find_one({"clientId": id})
    if not client:
        try:
            client = client_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if client:
        delete_result = client_collection.delete_one({"_id": client["_id"]})
        if delete_result.deleted_count == 1:
            return {"message": "Success"}
    return {"error": "Delete failed"}
