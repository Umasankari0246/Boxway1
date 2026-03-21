from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EmployeeSchema(BaseModel):
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

class UpdateEmployeeSchema(BaseModel):
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

def employee_helper(employee) -> dict:
    return {
        "id": str(employee["_id"]),
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
        "joinDate": employee.get("startDate")
    }
