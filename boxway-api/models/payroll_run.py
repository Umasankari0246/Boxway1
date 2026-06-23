from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PayrollRunSchema(BaseModel):
    period: str = Field(...)
    employees: int = Field(default=0)
    adHoc: int = Field(default=0)
    grossAmount: float = Field(default=0)
    netAmount: float = Field(default=0)
    status: str = Field(default="Pending Approval")
    processedDate: Optional[str] = Field(None)
    approvedBy: Optional[str] = Field(None)

class UpdatePayrollRunSchema(BaseModel):
    period: Optional[str] = None
    employees: Optional[int] = None
    adHoc: Optional[int] = None
    grossAmount: Optional[float] = None
    netAmount: Optional[float] = None
    status: Optional[str] = None
    processedDate: Optional[str] = None
    approvedBy: Optional[str] = None

def payroll_run_helper(payroll_run) -> dict:
    return {
        "id": str(payroll_run["_id"]),
        "period": payroll_run["period"],
        "employees": payroll_run["employees"],
        "adHoc": payroll_run["adHoc"],
        "grossAmount": payroll_run["grossAmount"],
        "netAmount": payroll_run["netAmount"],
        "status": payroll_run["status"],
        "processedDate": payroll_run.get("processedDate"),
        "approvedBy": payroll_run.get("approvedBy"),
        "createdAt": payroll_run.get("createdAt"),
        "updatedAt": payroll_run.get("updatedAt"),
    }
