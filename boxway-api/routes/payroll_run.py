from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.payroll_run import PayrollRunSchema, UpdatePayrollRunSchema, payroll_run_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
payroll_run_collection = db.get_collection("payroll_runs")

@router.post("/", response_description="Payroll run added into the database")
async def add_payroll_run(payroll_run: PayrollRunSchema = Body(...)):
    payroll_run_dict = jsonable_encoder(payroll_run)
    
    # Add timestamps
    payroll_run_dict["createdAt"] = datetime.utcnow().isoformat()
    payroll_run_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Generate payrollRunId if not provided
    if not payroll_run_dict.get("payrollRunId"):
        payroll_run_dict["payrollRunId"] = f"PR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    new_payroll_run = payroll_run_collection.insert_one(payroll_run_dict)
    created_payroll_run = payroll_run_collection.find_one({"_id": new_payroll_run.inserted_id})
    return {"message": "Success", "data": payroll_run_helper(created_payroll_run)}

@router.get("/", response_description="Payroll runs retrieved")
async def get_payroll_runs():
    payroll_runs = []
    for payroll_run in payroll_run_collection.find():
        payroll_runs.append(payroll_run_helper(payroll_run))
    return {"message": "Success", "data": payroll_runs}

@router.get("/{id}", response_description="Payroll run data retrieved")
async def get_payroll_run(id: str):
    # Try to find by payrollRunId first, then by MongoDB _id
    payroll_run = payroll_run_collection.find_one({"payrollRunId": id})
    if not payroll_run:
        try:
            payroll_run = payroll_run_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if payroll_run:
        return {"message": "Success", "data": payroll_run_helper(payroll_run)}
    return {"error": "Payroll run not found"}

@router.put("/{id}")
@router.patch("/{id}")
async def update_payroll_run(id: str, req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    
    # Add updated timestamp
    req["updatedAt"] = datetime.utcnow().isoformat()
    
    # Try to find by payrollRunId first, then by MongoDB _id
    payroll_run = payroll_run_collection.find_one({"payrollRunId": id})
    if not payroll_run:
        try:
            payroll_run = payroll_run_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if payroll_run:
        update_result = payroll_run_collection.update_one({"_id": payroll_run["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_payroll_run = payroll_run_collection.find_one({"_id": payroll_run["_id"]})
            return {"message": "Success", "data": payroll_run_helper(updated_payroll_run)}
    return {"error": "Update failed"}

@router.delete("/{id}", response_description="Payroll run deleted")
async def delete_payroll_run(id: str):
    # Try to find by payrollRunId first, then by MongoDB _id
    payroll_run = payroll_run_collection.find_one({"payrollRunId": id})
    if not payroll_run:
        try:
            payroll_run = payroll_run_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if payroll_run:
        delete_result = payroll_run_collection.delete_one({"_id": payroll_run["_id"]})
        if delete_result.deleted_count == 1:
            return {"message": "Success"}
    return {"error": "Delete failed"}
