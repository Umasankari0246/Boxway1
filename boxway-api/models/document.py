from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CommentSchema(BaseModel):
    id: Optional[str]
    author: str
    avatar: str
    color: str
    role: str
    time: str
    text: str
    likes: Optional[int] = 0
    liked: Optional[bool] = False

class DocumentSchema(BaseModel):
    name: str = Field(...)
    type: str = Field(...)
    folderType: str = Field(...)
    size: str = Field(...)
    uploadedBy: str = Field(...)
    uploadDate: str = Field(...)
    project: Optional[str] = None
    projectCode: Optional[str] = None
    client: Optional[str] = None
    version: Optional[str] = "1.0"
    description: Optional[str] = None
    comments: Optional[List[dict]] = []
    fileUrl: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateDocumentSchema(BaseModel):
    name: Optional[str]
    type: Optional[str]
    folderType: Optional[str]
    size: Optional[str]
    uploadedBy: Optional[str]
    uploadDate: Optional[str]
    project: Optional[str]
    projectCode: Optional[str]
    client: Optional[str]
    version: Optional[str]
    description: Optional[str]
    comments: Optional[List[dict]]
    fileUrl: Optional[str]

def document_helper(document) -> dict:
    return {
        "id": document.get("documentId") or str(document["_id"]),
        "documentId": document.get("documentId"),
        "name": document.get("name"),
        "type": document.get("type"),
        "folderType": document.get("folderType"),
        "size": document.get("size"),
        "uploadedBy": document.get("uploadedBy"),
        "uploadDate": document.get("uploadDate"),
        "project": document.get("project"),
        "projectCode": document.get("projectCode"),
        "client": document.get("client"),
        "version": document.get("version", "1.0"),
        "description": document.get("description"),
        "comments": document.get("comments", []),
        "fileUrl": document.get("fileUrl"),
        "createdAt": document.get("createdAt"),
        "updatedAt": document.get("updatedAt")
    }
