from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.invoice import InvoiceSchema, UpdateInvoiceSchema, invoice_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
invoice_collection = db.get_collection("invoices")

@router.post("/", response_description="Invoice added into the database")
async def add_invoice(invoice: InvoiceSchema = Body(...)):
    invoice_dict = jsonable_encoder(invoice)
    
    # Add timestamps
    invoice_dict["createdAt"] = datetime.utcnow().isoformat()
    invoice_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Generate invoiceId if not provided
    if not invoice_dict.get("invoiceId"):
        invoice_dict["invoiceId"] = f"#INV-{datetime.utcnow().strftime('%Y')}-{str(invoice_collection.count_documents({}) + 1).zfill(3)}"
    
    new_invoice = invoice_collection.insert_one(invoice_dict)
    created_invoice = invoice_collection.find_one({"_id": new_invoice.inserted_id})
    return {"message": "Success", "data": invoice_helper(created_invoice)}

@router.get("/", response_description="Invoices retrieved")
async def get_invoices():
    invoices = []
    client_collection = db.get_collection("clients")
    project_collection = db.get_collection("projects")
    
    for invoice in invoice_collection.find():
        # Resolve client name if clientId exists but client name is missing or unknown
        if invoice.get("clientId") and (not invoice.get("client") or invoice.get("client") == "Unknown Client"):
            client = client_collection.find_one({"clientId": invoice["clientId"]})
            if client:
                invoice["client"] = client.get("name", client.get("companyName", "Unknown Client"))
        
        # If no clientId but client name is unknown, try to find by name
        if not invoice.get("clientId") and (not invoice.get("client") or invoice.get("client") == "Unknown Client"):
            # Try to find a client to associate (default to first available)
            client = client_collection.find_one()
            if client:
                invoice["clientId"] = client.get("clientId")
                invoice["client"] = client.get("name", client.get("companyName", "Unknown Client"))
        
        # Resolve project name if projectId exists but project name is missing or unknown
        if invoice.get("projectId") and (not invoice.get("project") or invoice.get("project") == "Unknown Project"):
            project = project_collection.find_one({"projectId": invoice["projectId"]})
            if project:
                invoice["project"] = project.get("name", "Unknown Project")
        
        # If no projectId but project name is unknown, try to find by name
        if not invoice.get("projectId") and (not invoice.get("project") or invoice.get("project") == "Unknown Project"):
            # Try to find a project to associate (default to first available)
            project = project_collection.find_one()
            if project:
                invoice["projectId"] = project.get("projectId")
                invoice["project"] = project.get("name", "Unknown Project")
        
        invoices.append(invoice_helper(invoice))
    return {"message": "Success", "data": invoices}

@router.get("/{id}", response_description="Invoice data retrieved")
async def get_invoice(id: str):
    # Try to find by invoiceId first, then by MongoDB _id
    invoice = invoice_collection.find_one({"invoiceId": id})
    if not invoice:
        try:
            invoice = invoice_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if invoice:
        return {"message": "Success", "data": invoice_helper(invoice)}
    return {"error": "Invoice not found"}

@router.put("/{id}")
@router.patch("/{id}")
async def update_invoice(id: str, req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    
    # Add updated timestamp
    req["updatedAt"] = datetime.utcnow().isoformat()
    
    # Try to find by invoiceId first, then by MongoDB _id
    invoice = invoice_collection.find_one({"invoiceId": id})
    if not invoice:
        try:
            invoice = invoice_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if invoice:
        update_result = invoice_collection.update_one({"_id": invoice["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_invoice = invoice_collection.find_one({"_id": invoice["_id"]})
            return {"message": "Success", "data": invoice_helper(updated_invoice)}
    return {"error": "Update failed"}

@router.delete("/{id}", response_description="Invoice deleted")
async def delete_invoice(id: str):
    # Try to find by invoiceId first, then by MongoDB _id
    invoice = invoice_collection.find_one({"invoiceId": id})
    if not invoice:
        try:
            invoice = invoice_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if invoice:
        delete_result = invoice_collection.delete_one({"_id": invoice["_id"]})
        if delete_result.deleted_count == 1:
            return {"message": "Success"}
    return {"error": "Delete failed"}
