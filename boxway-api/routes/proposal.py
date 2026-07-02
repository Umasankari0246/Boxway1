from fastapi import APIRouter, Body
from fastapi.encoders import jsonable_encoder
from database import get_database
from models.proposal import ProposalSchema, UpdateProposalSchema, proposal_helper
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()
db = get_database()
proposal_collection = db.get_collection("proposals")

@router.post("/", response_description="Proposal added into the database")
async def add_proposal(proposal: ProposalSchema = Body(...)):
    proposal_dict = jsonable_encoder(proposal)
    
    # Add timestamps
    proposal_dict["createdAt"] = datetime.utcnow().isoformat()
    proposal_dict["updatedAt"] = datetime.utcnow().isoformat()
    
    # Generate proposalId if not provided
    if not proposal_dict.get("proposalId"):
        proposal_dict["proposalId"] = f"PRP-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    new_proposal = proposal_collection.insert_one(proposal_dict)
    created_proposal = proposal_collection.find_one({"_id": new_proposal.inserted_id})
    return {"message": "Success", "data": proposal_helper(created_proposal)}

@router.get("/", response_description="Proposals retrieved")
async def get_proposals():
    proposals = []
    for proposal in proposal_collection.find():
        proposals.append(proposal_helper(proposal))
    return {"message": "Success", "data": proposals}

@router.get("/{id}", response_description="Proposal data retrieved")
async def get_proposal(id: str):
    # Try to find by proposalId first, then by MongoDB _id
    proposal = proposal_collection.find_one({"proposalId": id})
    if not proposal:
        try:
            proposal = proposal_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if proposal:
        return {"message": "Success", "data": proposal_helper(proposal)}
    return {"error": "Proposal not found"}

@router.put("/{id}")
@router.patch("/{id}")
async def update_proposal(id: str, req: dict = Body(...)):
    # Filter out None values
    req = {k: v for k, v in req.items() if v is not None}
    
    # Add updated timestamp
    req["updatedAt"] = datetime.utcnow().isoformat()
    
    # Try to find by proposalId first, then by MongoDB _id
    proposal = proposal_collection.find_one({"proposalId": id})
    if not proposal:
        try:
            proposal = proposal_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if proposal:
        update_result = proposal_collection.update_one({"_id": proposal["_id"]}, {"$set": req})
        if update_result.matched_count == 1:
            updated_proposal = proposal_collection.find_one({"_id": proposal["_id"]})
            return {"message": "Success", "data": proposal_helper(updated_proposal)}
    return {"error": "Update failed"}

@router.delete("/{id}", response_description="Proposal deleted")
async def delete_proposal(id: str):
    # Try to find by proposalId first, then by MongoDB _id
    proposal = proposal_collection.find_one({"proposalId": id})
    if not proposal:
        try:
            proposal = proposal_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if proposal:
        delete_result = proposal_collection.delete_one({"_id": proposal["_id"]})
        if delete_result.deleted_count == 1:
            return {"message": "Success"}
    return {"error": "Delete failed"}

@router.get("/{id}/comments", response_description="Get proposal comments")
async def get_proposal_comments(id: str):
    # Try to find by proposalId first, then by MongoDB _id
    proposal = proposal_collection.find_one({"proposalId": id})
    if not proposal:
        try:
            proposal = proposal_collection.find_one({"_id": ObjectId(id)})
        except:
            pass
    if proposal:
        comments = proposal.get("comments", [])
        return {"message": "Success", "data": comments}
    return {"error": "Proposal not found"}
