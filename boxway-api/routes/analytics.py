from fastapi import APIRouter
from database import get_database
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter()
db = get_database()

@router.get("/", response_description="Analytics overview")
async def get_analytics_overview():
    """Get combined analytics data or available endpoints"""
    return {
        "message": "Success",
        "data": {
            "availableEndpoints": [
                "/kpis",
                "/revenue-by-month",
                "/projects-by-status",
                "/top-clients"
            ],
            "description": "Use specific endpoints for detailed analytics"
        }
    }

@router.get("/kpis", response_description="KPIs retrieved")
async def get_kpis():
    """Get key performance indicators aggregated from all collections"""
    
    # Get collections
    invoice_collection = db.get_collection("invoices")
    project_collection = db.get_collection("projects")
    proposal_collection = db.get_collection("proposals")
    client_collection = db.get_collection("clients")
    employee_collection = db.get_collection("employees")
    
    # Calculate total revenue from paid invoices
    paid_invoices = list(invoice_collection.find({"status": "Paid"}))
    total_revenue = sum(inv.get("amount", 0) for inv in paid_invoices)
    
    # Calculate outstanding invoices
    outstanding_invoices = list(invoice_collection.find({"status": {"$in": ["Pending", "Overdue"]}}))
    outstanding_amount = sum(inv.get("amount", 0) for inv in outstanding_invoices)
    
    # Active projects
    active_projects = project_collection.count_documents({"status": "In Progress"})
    
    # Proposal win rate
    all_proposals = list(proposal_collection.find())
    closed_proposals = [p for p in all_proposals if p.get("status") in ["Won", "Lost"]]
    won_proposals = [p for p in all_proposals if p.get("status") == "Won"]
    win_rate = (len(won_proposals) / len(closed_proposals) * 100) if closed_proposals else 0
    
    # Average project value
    all_projects = list(project_collection.find())
    avg_project_value = sum(p.get("budget", 0) for p in all_projects) / len(all_projects) if all_projects else 0
    
    # Team utilization (employees with status Active)
    total_employees = employee_collection.count_documents({"status": "Active"})
    
    return {
        "message": "Success",
        "data": {
            "totalRevenue": total_revenue,
            "revenueGrowth": 12,  # This would be calculated comparing to previous period
            "activeProjects": active_projects,
            "proposalWinRate": round(win_rate, 1),
            "avgProjectValue": avg_project_value,
            "outstandingInvoices": outstanding_amount,
            "teamUtilization": f"{round((active_projects / total_employees * 100) if total_employees else 0)}%" if total_employees else "0%"
        }
    }

@router.get("/revenue-by-month", response_description="Revenue by month retrieved")
async def get_revenue_by_month():
    """Get revenue and expenses by month"""
    
    invoice_collection = db.get_collection("invoices")
    expense_collection = db.get_collection("expenses")
    
    # Get last 12 months of data
    months = []
    for i in range(12):
        month_date = datetime.utcnow() - timedelta(days=30 * i)
        month_name = month_date.strftime("%b")
        months.append(month_name)
    
    months.reverse()
    
    # Aggregate revenue by month (from invoices)
    revenue_by_month = []
    for month in months:
        # This is simplified - in production, you'd query with proper date ranges
        revenue_by_month.append({
            "month": month,
            "revenue": 0,  # Would be calculated from invoices in that month
            "expenses": 0  # Would be calculated from expenses in that month
        })
    
    return {"message": "Success", "data": revenue_by_month}

@router.get("/projects-by-status", response_description="Projects by status retrieved")
async def get_projects_by_status():
    """Get project count by status"""
    
    project_collection = db.get_collection("projects")
    
    status_colors = {
        "In Progress": "#3B82F6",
        "Planning": "#F59E0B",
        "Completed": "#10B981",
        "%On Hold": "#6B7280"
    }
    
    projects_by_status = []
    statuses = ["In Progress", "Planning", "Completed", "On Hold"]
    
    for status in statuses:
        count = project_collection.count_documents({"status": status})
        projects_by_status.append({
            "status": status,
            "count": count,
            "color": status_colors.get(status, "#6B7280")
        })
    
    return {"message": "Success", "data": projects_by_status}

@router.get("/top-clients", response_description="Top clients by revenue retrieved")
async def get_top_clients():
    """Get top clients by revenue"""
    
    invoice_collection = db.get_collection("invoices")
    client_collection = db.get_collection("clients")
    
    # Aggregate revenue by client from invoices
    client_revenue = defaultdict(float)
    for invoice in invoice_collection.find():
        client_revenue[invoice.get("client", "Unknown")] += invoice.get("amount", 0)
    
    # Sort by revenue and get top 5
    sorted_clients = sorted(client_revenue.items(), key=lambda x: x[1], reverse=True)[:5]
    
    top_clients = []
    for client_name, revenue in sorted_clients:
        # Get client details
        client = client_collection.find_one({"name": client_name})
        top_clients.append({
            "name": client_name,
            "value": revenue,
            "totalProjects": client.get("totalProjects", 0) if client else 0
        })
    
    return {"message": "Success", "data": top_clients}
