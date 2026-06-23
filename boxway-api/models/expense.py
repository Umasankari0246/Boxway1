from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ExpenseSchema(BaseModel):
    title: str = Field(...)
    category: str = Field(...)
    amount: float = Field(...)
    date: str = Field(...)
    project: Optional[str] = None
    submittedBy: str = Field(...)
    status: str = Field(...)
    notes: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateExpenseSchema(BaseModel):
    title: Optional[str]
    category: Optional[str]
    amount: Optional[float]
    date: Optional[str]
    project: Optional[str]
    submittedBy: Optional[str]
    status: Optional[str]
    notes: Optional[str]

def expense_helper(expense) -> dict:
    return {
        "id": expense.get("expenseId") or str(expense["_id"]),
        "expenseId": expense.get("expenseId"),
        "title": expense.get("title"),
        "category": expense.get("category"),
        "amount": expense.get("amount"),
        "date": expense.get("date"),
        "project": expense.get("project"),
        "submittedBy": expense.get("submittedBy"),
        "status": expense.get("status"),
        "notes": expense.get("notes"),
        "createdAt": expense.get("createdAt"),
        "updatedAt": expense.get("updatedAt")
    }
