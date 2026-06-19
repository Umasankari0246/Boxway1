from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.employee import EmployeeSchema, UpdateEmployeeSchema, employee_helper
from bson.objectid import ObjectId

router = APIRouter()
db = get_database()
employee_collection = db.get_collection("employees")

@router.post("/", response_description="Employee added into the database")
async def add_employee(employee: EmployeeSchema = Body(...)):
    employee_dict = jsonable_encoder(employee)
    new_employee = employee_collection.insert_one(employee_dict)
    created_employee = employee_collection.find_one({"_id": new_employee.inserted_id})
    return {"message": "Success", "data": employee_helper(created_employee)}

@router.get("/", response_description="Employees retrieved")
async def get_employees():
    employees = []
    for emp in employee_collection.find():
        employees.append(employee_helper(emp))
    return {"message": "Success", "data": employees}

@router.get("/{id}", response_description="Employee data retrieved")
async def get_employee(id: str):
    # Try to find by employeeId first, then by MongoDB _id
    employee = employee_collection.find_one({"employeeId": id})
    if not employee:
        try:
            employee = employee_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if employee:
        return {"message": "Success", "data": employee_helper(employee)}
    return {"error": "Employee not found"}

@router.put("/{id}")
@router.patch("/{id}")
async def update_employee(id: str, req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    # Try to find by employeeId first, then by MongoDB _id
    employee = employee_collection.find_one({"employeeId": id})
    if not employee:
        try:
            employee = employee_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if employee:
        update_result = employee_collection.update_one({"_id": employee["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_employee = employee_collection.find_one({"_id": employee["_id"]})
            return {"message": "Success", "data": employee_helper(updated_employee)}
    return {"error": "Update failed"}

@router.delete("/{id}", response_description="Employee deleted")
async def delete_employee(id: str):
    # Try to find by employeeId first, then by MongoDB _id
    employee = employee_collection.find_one({"employeeId": id})
    if not employee:
        try:
            employee = employee_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if employee:
        delete_result = employee_collection.delete_one({"_id": employee["_id"]})
        if delete_result.deleted_count == 1:
            return {"message": "Success"}
    return {"error": "Delete failed"}
