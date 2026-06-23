from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PayslipSchema(BaseModel):
    employeeId: str = Field(...)
    employeeName: str = Field(...)
    period: str = Field(...)
    grossSalary: float = Field(...)
    deductions: float = Field(...)
    net: float = Field(...)
    status: str = Field(...)
    issuedDate: Optional[str] = None
    notes: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdatePayslipSchema(BaseModel):
    employeeId: Optional[str]
    employeeName: Optional[str]
    period: Optional[str]
    grossSalary: Optional[float]
    deductions: Optional[float]
    net: Optional[float]
    status: Optional[str]
    issuedDate: Optional[str]
    notes: Optional[str]

def payslip_helper(payslip) -> dict:
    return {
        "id": payslip.get("payslipId") or str(payslip["_id"]),
        "payslipId": payslip.get("payslipId"),
        "employeeId": payslip.get("employeeId"),
        "employeeName": payslip.get("employeeName"),
        "period": payslip.get("period"),
        "grossSalary": payslip.get("grossSalary"),
        "deductions": payslip.get("deductions"),
        "net": payslip.get("net"),
        "status": payslip.get("status"),
        "issuedDate": payslip.get("issuedDate"),
        "notes": payslip.get("notes"),
        "createdAt": payslip.get("createdAt"),
        "updatedAt": payslip.get("updatedAt")
    }
