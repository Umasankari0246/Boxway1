from pydantic import BaseModel, Field
from typing import Optional, List
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
    phase: Optional[int] = Field(default=1)
    totalPhases: Optional[int] = Field(default=8)
    teamMembers: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = Field(default="")

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
    phase: Optional[int] = None
    totalPhases: Optional[int] = None
    teamMembers: Optional[List[str]] = None
    description: Optional[str] = None

def project_helper(project) -> dict:
    # Calculate progress if not present
    phase = project.get("phase", 1)
    total_phases = project.get("totalPhases", 8)
    progress = project.get("progress")
    if progress is None or progress == 0 and phase > 1:
        progress = round((phase / total_phases) * 100)
    
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
        "progress": progress,
        "startDate": project.get("startDate"),
        "endDate": project.get("endDate"),
        "city": project.get("city"),
        "phase": phase,
        "totalPhases": total_phases,
        "teamMembers": project.get("teamMembers", []),
        "description": project.get("description", ""),
        "createdAt": project.get("createdAt"),
        "updatedAt": project.get("updatedAt"),
    }
