from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Insight(BaseModel):
    id: str
    type: str = Field(..., description="Type of insight: warning, opportunity, alert, insight, positive")
    icon: str
    title: str
    priority: str = Field(..., description="Priority level: High, Medium, Low")
    category: str
    description: str
    generatedAt: str
    action: str

class InsightCreate(BaseModel):
    type: str
    icon: str
    title: str
    priority: str
    category: str
    description: str
    action: str

class InsightUpdate(BaseModel):
    type: Optional[str] = None
    icon: Optional[str] = None
    title: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    action: Optional[str] = None

def insight_helper(insight) -> dict:
    return {
        "id": str(insight.get("_id", insight.get("id", ""))),
        "type": insight.get("type", "insight"),
        "icon": insight.get("icon", "psychology"),
        "title": insight.get("title", ""),
        "priority": insight.get("priority", "Medium"),
        "category": insight.get("category", "General"),
        "description": insight.get("description", ""),
        "generatedAt": insight.get("generatedAt", datetime.utcnow().isoformat()),
        "action": insight.get("action", "View Details")
    }
