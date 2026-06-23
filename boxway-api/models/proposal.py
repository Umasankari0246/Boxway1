from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProposalSchema(BaseModel):
    title: str = Field(...)
    client: str = Field(...)
    clientContact: Optional[str] = Field(None)
    lead: str = Field(...)
    value: float = Field(default=0)
    status: str = Field(default="Draft")
    phase: Optional[str] = Field(default="Initial")
    version: int = Field(default=1)
    submittedDate: Optional[str] = Field(None)
    createdAt: Optional[str] = Field(None)

class UpdateProposalSchema(BaseModel):
    title: Optional[str] = None
    client: Optional[str] = None
    clientContact: Optional[str] = None
    lead: Optional[str] = None
    value: Optional[float] = None
    status: Optional[str] = None
    phase: Optional[str] = None
    version: Optional[int] = None
    submittedDate: Optional[str] = None

def proposal_helper(proposal) -> dict:
    return {
        "id": str(proposal["_id"]),
        "title": proposal["title"],
        "client": proposal["client"],
        "clientContact": proposal.get("clientContact"),
        "lead": proposal["lead"],
        "value": proposal["value"],
        "status": proposal["status"],
        "phase": proposal.get("phase"),
        "version": proposal["version"],
        "submittedDate": proposal.get("submittedDate"),
        "createdAt": proposal.get("createdAt"),
        "updatedAt": proposal.get("updatedAt"),
    }
