from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InvoiceSchema(BaseModel):
    invoiceId: Optional[str]
    client: str = Field(...)
    project: str = Field(...)
    date: str = Field(...)
    amount: float = Field(...)
    status: str = Field(...)
    dueDate: Optional[str]
    notes: Optional[str]
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateInvoiceSchema(BaseModel):
    client: Optional[str]
    project: Optional[str]
    date: Optional[str]
    amount: Optional[float]
    status: Optional[str]
    dueDate: Optional[str]
    notes: Optional[str]

def invoice_helper(invoice) -> dict:
    return {
        "id": invoice.get("invoiceId") or str(invoice["_id"]),
        "invoiceId": invoice.get("invoiceId"),
        "client": invoice.get("client"),
        "project": invoice.get("project"),
        "date": invoice.get("date"),
        "amount": invoice.get("amount"),
        "status": invoice.get("status"),
        "dueDate": invoice.get("dueDate"),
        "notes": invoice.get("notes"),
        "createdAt": invoice.get("createdAt"),
        "updatedAt": invoice.get("updatedAt")
    }
