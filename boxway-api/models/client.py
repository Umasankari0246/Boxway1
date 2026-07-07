from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ClientSchema(BaseModel):
    name: str = Field(...)
    contactPerson: str = Field(...)
    email: str = Field(...)
    phone: str = Field(...)
    type: str = Field(...)
    city: Optional[str] = None
    address: Optional[str] = None
    totalProjects: Optional[int] = 0
    totalValue: Optional[float] = 0.0
    status: Optional[str] = "Active"
    notes: Optional[str] = None
    projectType: Optional[str] = None
    timeline: Optional[str] = None
    description: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateClientSchema(BaseModel):
    name: Optional[str]
    contactPerson: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    type: Optional[str]
    city: Optional[str]
    address: Optional[str]
    totalProjects: Optional[int]3
    totalValue: Optional[float]
    status: Optional[str]
    notes: Optional[str]
    projectType: Optional[str]
    timeline: Optional[str]
    description: Optional[str]

def client_helper(client) -> dict:
    return {
        "id": client.get("clientId") or str(client["_id"]),
        "clientId": client.get("clientId"),
        "name": client.get("name"),
        "contactPerson": client.get("contactPerson"),
        "email": client.get("email"),
        "phone": client.get("phone"),
        "type": client.get("type"),
        "city": client.get("city"),
        "address": client.get("address"),
        "totalProjects": client.get("totalProjects", 0),
        "totalValue": client.get("totalValue", 0.0),
        "status": client.get("status", "Active"),
        "notes": client.get("notes"),
        "projectType": client.get("projectType"),
        "timeline": client.get("timeline"),
        "description": client.get("description"),
        "createdAt": client.get("createdAt"),
        "updatedAt": client.get("updatedAt")
    }
