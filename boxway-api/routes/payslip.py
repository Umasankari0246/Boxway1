from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.payslip import PayslipSchema, UpdatePayslipSchema, payslip_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
payslip_collection = db.get_collection("payslips")

@router.post("/", response_description="Payslip added into the database")
async def add_payslip(payslip: PayslipSchema = Body(...)):
    payslip_dict = jsonable_encoder(payslip)
    
    # Add timestamps
    payslip_dict["createdAt"] = datetime.utcnow().isoformat()
    payslip_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    new_payslip = payslip_collection.insert_one(payslip_dict)
    created_payslip = payslip_collection.find_one({"_id": new_payslip.inserted_id})
    return {"message": "Success", "data": payslip_helper(created_payslip)}

@router.get("/", response_description="Retrieve all payslips")
async def get_payslips():
    payslips = payslip_collection.find()
    return {"message": "Success", "data": [payslip_helper(pay) for pay in payslips]}

@router.get("/{id}", response_description="Retrieve a single payslip")
async def get_payslip(id: str):
    payslip = payslip_collection.find_one({"_id": ObjectId(id)})
    if payslip:
        return {"message": "Success", "data": payslip_helper(payslip)}
    return {"message": "Payslip not found"}, 404

@router.put("/{id}", response_description="Update a payslip")
async def update_payslip(id: str, req: UpdatePayslipSchema = Body(...)):
    payslip = payslip_collection.find_one({"_id": ObjectId(id)})
    if payslip:
        updated_payslip = payslip_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": jsonable_encoder(req)}
        )
        if updated_payslip:
            return {"message": "Success"}
    return {"message": "Payslip not found"}, 404

@router.patch("/{id}", response_description="Partially update a payslip")
async def patch_payslip(id: str, req: dict = Body(...)):
    payslip = payslip_collection.find_one({"_id": ObjectId(id)})
    if payslip:
        req["updatedAt"] = datetime.utcnow().isoformat()
        updated_payslip = payslip_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": req}
        )
        if updated_payslip:
            updated_pay = payslip_collection.find_one({"_id": ObjectId(id)})
            return {"message": "Success", "data": payslip_helper(updated_pay)}
    return {"message": "Payslip not found"}, 404

@router.delete("/{id}", response_description="Delete a payslip")
async def delete_payslip(id: str):
    payslip = payslip_collection.find_one({"_id": ObjectId(id)})
    if payslip:
        payslip_collection.delete_one({"_id": ObjectId(id)})
        return {"message": "Success"}
    return {"message": "Payslip not found"}, 404
