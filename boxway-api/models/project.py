from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProjectSchema(BaseModel):
    projectId: Optional[str] = Field(None)
    name: str = Field(...)
    client: str = Field(...)
    lead: str = Field(...)
    type: str = Field(...)
    status: str = Field(default="Planning")
    budget: float = Field(default=0)
    spent: float = Field(default=0)
    progress: int = Field(default=0)
    startDate: Optional[str] = Field(None)
    endDate: Optional[str] = Field(None)
    city: Optional[str] = Field(None)

class UpdateProjectSchema(BaseModel):
    name: Optional[str] = None
    client: Optional[str] = None
    lead: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    spent: Optional[float] = None
    progress: Optional[int] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    city: Optional[str] = None

def project_helper(project) -> dict:
    return {
        "id": str(project["_id"]),
        "projectId": project.get("projectId"),
        "name": project["name"],
        "client": project["client"],
        "lead": project["lead"],
        "type": project["type"],
        "status": project["status"],
        "budget": project["budget"],
        "spent": project["spent"],
        "progress": project["progress"],
        "startDate": project.get("startDate"),
        "endDate": project.get("endDate"),
        "city": project.get("city"),
        "createdAt": project.get("createdAt"),
        "updatedAt": project.get("updatedAt"),
    }
