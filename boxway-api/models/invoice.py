from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class InvoiceSchema(BaseModel):
    invoiceId: Optional[str]
    clientId: Optional[str] = None
    client: str = Field(...)
    projectId: Optional[str] = None
    project: str = Field(...)
    date: str = Field(...)
    amount: float = Field(...)
    status: str = Field(...)
    dueDate: Optional[str]
    notes: Optional[str]
    paymentTerms: Optional[str] = None
    clientName: Optional[str] = None
    billingAddress: Optional[str] = None
    gstin: Optional[str] = None
    contactPerson: Optional[str] = None
    items: Optional[List[dict]] = Field(default_factory=list)
    attachments: Optional[List[dict]] = Field(default_factory=list)
    authorizedSignature: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateInvoiceSchema(BaseModel):
    clientId: Optional[str]
    client: Optional[str]
    projectId: Optional[str]
    project: Optional[str]
    date: Optional[str]
    amount: Optional[float]
    status: Optional[str]
    dueDate: Optional[str]
    notes: Optional[str]
    paymentTerms: Optional[str]
    clientName: Optional[str]
    billingAddress: Optional[str]
    gstin: Optional[str]
    contactPerson: Optional[str]
    items: Optional[List[dict]]
    attachments: Optional[List[dict]]
    authorizedSignature: Optional[str]

def invoice_helper(invoice) -> dict:
    return {
        "id": invoice.get("invoiceId") or str(invoice["_id"]),
        "invoiceId": invoice.get("invoiceId"),
        "clientId": invoice.get("clientId"),
        "client": invoice.get("client"),
        "projectId": invoice.get("projectId"),
        "project": invoice.get("project"),
        "date": invoice.get("date"),
        "amount": invoice.get("amount"),
        "status": invoice.get("status"),
        "dueDate": invoice.get("dueDate"),
        "notes": invoice.get("notes"),
        "paymentTerms": invoice.get("paymentTerms"),
        "clientName": invoice.get("clientName"),
        "billingAddress": invoice.get("billingAddress"),
        "gstin": invoice.get("gstin"),
        "contactPerson": invoice.get("contactPerson"),
        "items": invoice.get("items", []),
        "attachments": invoice.get("attachments", []),
        "authorizedSignature": invoice.get("authorizedSignature"),
        "createdAt": invoice.get("createdAt"),
        "updatedAt": invoice.get("updatedAt")
    }
