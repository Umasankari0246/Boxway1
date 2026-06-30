from fastapi import APIRouter, Body, HTTPException
from bson import ObjectId
from datetime import datetime
from models.insights import InsightCreate, InsightUpdate, insight_helper
from database import get_database

router = APIRouter()

# Get the database and insights collection
db = get_database()
insights_collection = db.get_collection("insights")

# Default insights data
DEFAULT_INSIGHTS = [
    {
        "id": "1",
        "type": "warning",
        "icon": "warning",
        "title": "Invoice Overdue Alert",
        "priority": "High",
        "category": "Finance",
        "description": "Invoice INV-2023-045 for Sunrise Hospitality is 45+ days overdue. Immediate follow-up recommended.",
        "generatedAt": datetime.utcnow().isoformat(),
        "action": "View Invoice"
    },
    {
        "id": "2",
        "type": "opportunity",
        "icon": "trending_up",
        "title": "New Project Opportunity",
        "priority": "Medium",
        "category": "Sales",
        "description": "Based on historical patterns, Park & Associates may be ready for a new project. Last project completed 90 days ago.",
        "generatedAt": datetime.utcnow().isoformat(),
        "action": "Contact Client"
    },
    {
        "id": "3",
        "type": "alert",
        "icon": "people",
        "title": "Team Utilization Warning",
        "priority": "High",
        "category": "Resources",
        "description": "Design Department is at 112% utilization. Marcus Johnson is over-allocated at 115%. Consider redistributing workload.",
        "generatedAt": datetime.utcnow().isoformat(),
        "action": "View Schedule"
    },
    {
        "id": "4",
        "type": "insight",
        "icon": "analytics",
        "title": "Revenue Forecast Update",
        "priority": "Medium",
        "category": "Finance",
        "description": "Q2 2024 revenue projected at $198K-$215K, representing 14% growth over Q1. Based on active milestones and pending proposals.",
        "generatedAt": datetime.utcnow().isoformat(),
        "action": "View Report"
    },
    {
        "id": "5",
        "type": "positive",
        "icon": "check_circle",
        "title": "Budget Performance",
        "priority": "Low",
        "category": "Projects",
        "description": "Sunrise Boutique Hotel completed at 98.4% of budget - excellent performance. Meridian Tower on track at 49% spend with 45% completion.",
        "generatedAt": datetime.utcnow().isoformat(),
        "action": "View Details"
    },
    {
        "id": "6",
        "type": "warning",
        "icon": "schedule",
        "title": "Deadline Risk",
        "priority": "Medium",
        "category": "Projects",
        "description": "Meridian Tower has 3 critical milestones due within 7 days. Engineering team capacity at 78% - monitor closely.",
        "generatedAt": datetime.utcnow().isoformat(),
        "action": "Review Timeline"
    }
]

@router.get("/")
async def get_insights():
    """Get all AI insights"""
    try:
        insights = insights_collection.find()
        insights_list = [insight_helper(insight) for insight in insights]
        
        if not insights_list:
            # Return default insights if collection is empty
            return {"message": "Success", "data": DEFAULT_INSIGHTS}
        
        return {"message": "Success", "data": insights_list}
    except Exception as e:
        # If collection doesn't exist or error occurs, return default insights
        return {"message": "Success", "data": DEFAULT_INSIGHTS}

@router.post("/")
async def create_insight(insight: InsightCreate):
    """Create a new insight"""
    try:
        new_insight = {
            "type": insight.type,
            "icon": insight.icon,
            "title": insight.title,
            "priority": insight.priority,
            "category": insight.category,
            "description": insight.description,
            "action": insight.action,
            "generatedAt": datetime.utcnow().isoformat()
        }
        
        result = insights_collection.insert_one(new_insight)
        new_insight["id"] = str(result.inserted_id)
        
        return {"message": "Insight created successfully", "data": insight_helper(new_insight)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
@router.patch("/{id}")
async def update_insight(id: str, req: dict = Body(...)):
    """Update an insight by ID"""
    try:
        # Filter out None values
        req = {k: v for k, v in req.items() if v is not None}
        
        # Add updated timestamp
        req["generatedAt"] = datetime.utcnow().isoformat()
        
        # Try to find by id field first, then by MongoDB _id
        insight = insights_collection.find_one({"id": id})
        if not insight:
            try:
                insight = insights_collection.find_one({"_id": ObjectId(id)})
            except:
                pass
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Update the insight
        insights_collection.update_one(
            {"_id": insight["_id"]},
            {"$set": req}
        )
        
        updated_insight = insights_collection.find_one({"_id": insight["_id"]})
        return {"message": "Insight updated successfully", "data": insight_helper(updated_insight)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
async def delete_insight(id: str):
    """Delete an insight by ID"""
    try:
        # Try to find by id field first, then by MongoDB _id
        insight = insights_collection.find_one({"id": id})
        if not insight:
            try:
                insight = insights_collection.find_one({"_id": ObjectId(id)})
            except:
                pass
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        insights_collection.delete_one({"_id": insight["_id"]})
        return {"message": "Insight deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
