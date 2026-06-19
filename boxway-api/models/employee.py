from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EmployeeSchema(BaseModel):
    employeeId: Optional[str]
    name: str = Field(...)
    email: str = Field(...)
    phone: Optional[str]
    dob: Optional[str]
    gender: Optional[str]
    bloodGroup: Optional[str]
    city: Optional[str]
    role: Optional[str]
    department: Optional[str]
    employeeType: Optional[str]
    startDate: Optional[str]
    managerId: Optional[str]
    emergencyContactName: Optional[str]
    emergencyContactRelation: Optional[str]
    emergencyPhone: Optional[str]
    familyMembers: Optional[str]
    highestQualification: Optional[str]
    university: Optional[str]
    graduationYear: Optional[str]
    architectureSkills: Optional[List[str]] = []
    toolsSelection: Optional[List[str]] = []
    salary: Optional[float]
    basicPay: Optional[float]
    hra: Optional[float]
    allowances: Optional[float]
    taxId: Optional[str]
    status: Optional[str] = "Active"
    photoUrl: Optional[str]
    collegeDocs: Optional[List[dict]] = []

class UpdateEmployeeSchema(BaseModel):
    employeeId: Optional[str]
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    dob: Optional[str]
    gender: Optional[str]
    bloodGroup: Optional[str]
    city: Optional[str]
    role: Optional[str]
    department: Optional[str]
    employeeType: Optional[str]
    startDate: Optional[str]
    status: Optional[str]
    photoUrl: Optional[str]
    collegeDocs: Optional[List[dict]] = []

def employee_helper(employee) -> dict:
    return {
        "id": employee.get("employeeId") or str(employee["_id"]),
        "employeeId": employee.get("employeeId"),
        "name": employee.get("name"),
        "email": employee.get("email"),
        "phone": employee.get("phone"),
        "dob": employee.get("dob"),
        "gender": employee.get("gender"),
        "bloodGroup": employee.get("bloodGroup"),
        "city": employee.get("city"),
        "role": employee.get("role"),
        "department": employee.get("department"),
        "employeeType": employee.get("employeeType"),
        "startDate": employee.get("startDate"),
        "status": employee.get("status"),
        "highestQualification": employee.get("highestQualification"),
        "university": employee.get("university"),
        "graduationYear": employee.get("graduationYear"),
        "architectureSkills": employee.get("architectureSkills", []),
        "toolsSelection": employee.get("toolsSelection", []),
        "salary": employee.get("salary"),
        "joinDate": employee.get("startDate"),
        "basicPay": employee.get("basicPay"),
        "hra": employee.get("hra"),
        "allowances": employee.get("allowances"),
        "taxId": employee.get("taxId"),
        "familyMembers": employee.get("familyMembers"),
        "emergencyContactName": employee.get("emergencyContactName"),
        "emergencyContactRelation": employee.get("emergencyContactRelation"),
        "emergencyPhone": employee.get("emergencyPhone"),
        "managerId": employee.get("managerId"),
        "photoUrl": employee.get("photoUrl"),
        "collegeDocs": employee.get("collegeDocs", [])
    }
