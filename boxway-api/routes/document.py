from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.document import DocumentSchema, UpdateDocumentSchema, document_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
document_collection = db.get_collection("documents")

@router.post("/", response_description="Document added into the database")
async def add_document(document: DocumentSchema = Body(...)):
    document_dict = jsonable_encoder(document)
    
    # Add timestamps
    document_dict["createdAt"] = datetime.utcnow().isoformat()
    document_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    new_document = document_collection.insert_one(document_dict)
    created_document = document_collection.find_one({"_id": new_document.inserted_id})
    return {"message": "Success", "data": document_helper(created_document)}

@router.get("/", response_description="Retrieve all documents")
async def get_documents():
    documents = document_collection.find()
    return {"message": "Success", "data": [document_helper(doc) for doc in documents]}

@router.get("/{id}", response_description="Retrieve a single document")
async def get_document(id: str):
    document = document_collection.find_one({"_id": ObjectId(id)})
    if document:
        return {"message": "Success", "data": document_helper(document)}
    return {"message": "Document not found"}, 404

@router.put("/{id}", response_description="Update a document")
async def update_document(id: str, req: UpdateDocumentSchema = Body(...)):
    document = document_collection.find_one({"_id": ObjectId(id)})
    if document:
        updated_document = document_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": jsonable_encoder(req)}
        )
        if updated_document:
            return {"message": "Success"}
    return {"message": "Document not found"}, 404

@router.patch("/{id}", response_description="Partially update a document")
async def patch_document(id: str, req: dict = Body(...)):
    document = document_collection.find_one({"_id": ObjectId(id)})
    if document:
        req["updatedAt"] = datetime.utcnow().isoformat()
        updated_document = document_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": req}
        )
        if updated_document:
            updated_doc = document_collection.find_one({"_id": ObjectId(id)})
            return {"message": "Success", "data": document_helper(updated_doc)}
    return {"message": "Document not found"}, 404

@router.delete("/{id}", response_description="Delete a document")
async def delete_document(id: str):
    document = document_collection.find_one({"_id": ObjectId(id)})
    if document:
        document_collection.delete_one({"_id": ObjectId(id)})
        return {"message": "Success"}
    return {"message": "Document not found"}, 404
