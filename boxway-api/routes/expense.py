from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.expense import ExpenseSchema, UpdateExpenseSchema, expense_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
expense_collection = db.get_collection("expenses")

@router.post("/", response_description="Expense added into the database")
async def add_expense(expense: ExpenseSchema = Body(...)):
    expense_dict = jsonable_encoder(expense)
    
    # Add timestamps
    expense_dict["createdAt"] = datetime.utcnow().isoformat()
    expense_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    new_expense = expense_collection.insert_one(expense_dict)
    created_expense = expense_collection.find_one({"_id": new_expense.inserted_id})
    return {"message": "Success", "data": expense_helper(created_expense)}

@router.get("/", response_description="Retrieve all expenses")
async def get_expenses():
    expenses = expense_collection.find()
    return {"message": "Success", "data": [expense_helper(exp) for exp in expenses]}

@router.get("/{id}", response_description="Retrieve a single expense")
async def get_expense(id: str):
    expense = expense_collection.find_one({"_id": ObjectId(id)})
    if expense:
        return {"message": "Success", "data": expense_helper(expense)}
    return {"message": "Expense not found"}, 404

@router.put("/{id}", response_description="Update an expense")
async def update_expense(id: str, req: UpdateExpenseSchema = Body(...)):
    expense = expense_collection.find_one({"_id": ObjectId(id)})
    if expense:
        updated_expense = expense_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": jsonable_encoder(req)}
        )
        if updated_expense:
            return {"message": "Success"}
    return {"message": "Expense not found"}, 404

@router.patch("/{id}", response_description="Partially update an expense")
async def patch_expense(id: str, req: dict = Body(...)):
    expense = expense_collection.find_one({"_id": ObjectId(id)})
    if expense:
        req["updatedAt"] = datetime.utcnow().isoformat()
        updated_expense = expense_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": req}
        )
        if updated_expense:
            updated_exp = expense_collection.find_one({"_id": ObjectId(id)})
            return {"message": "Success", "data": expense_helper(updated_exp)}
    return {"message": "Expense not found"}, 404

@router.delete("/{id}", response_description="Delete an expense")
async def delete_expense(id: str):
    expense = expense_collection.find_one({"_id": ObjectId(id)})
    if expense:
        expense_collection.delete_one({"_id": ObjectId(id)})
        return {"message": "Success"}
    return {"message": "Expense not found"}, 404
