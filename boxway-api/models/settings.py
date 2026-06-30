from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CompanyProfileSchema(BaseModel):
    companyName: str = Field(...)
    tagline: Optional[str] = None
    businessEmail: str = Field(...)
    phone: Optional[str] = None
    headquarters: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    foundedYear: Optional[int] = None
    teamSize: Optional[int] = None

class UserSchema(BaseModel):
    name: str = Field(...)
    email: str = Field(...)
    role: str = Field(...)
    status: str = Field(default="Active")
    joinedDate: Optional[str] = None
    lastActive: Optional[str] = None

class IntegrationSchema(BaseModel):
    name: str = Field(...)
    description: str = Field(...)
    status: str = Field(default="Disconnected")
    icon: Optional[str] = None
    lastSync: Optional[str] = None
    config: Optional[dict] = None

class InvoiceRecordSchema(BaseModel):
    id: str = Field(...)
    date: str = Field(...)
    amount: str = Field(...)
    status: str = Field(...)

class BillingInfoSchema(BaseModel):
    plan: str = Field(default="Professional")
    price: str = Field(default="$299/month")
    nextBillingDate: Optional[str] = None
    status: str = Field(default="Active")
    invoices: Optional[List[InvoiceRecordSchema]] = []
    features: Optional[List[str]] = []

class NotificationSchema(BaseModel):
    type: str = Field(...)
    enabled: bool = Field(default=True)
    email: bool = Field(default=True)
    inApp: bool = Field(default=True)

class AppearanceSchema(BaseModel):
    theme: str = Field(default="Light")
    language: str = Field(default="English")
    dateFormat: str = Field(default="MM/DD/YYYY")
    currency: str = Field(default="USD ($)")
    fontSize: str = Field(default="Medium")

class SecuritySchema(BaseModel):
    twoFactorEnabled: bool = Field(default=False)
    sessionTimeout: int = Field(default=30)
    passwordMinLength: int = Field(default=8)
    requireStrongPassword: bool = Field(default=True)

class SettingsSchema(BaseModel):
    companyProfile: Optional[CompanyProfileSchema] = None
    users: Optional[List[UserSchema]] = []
    integrations: Optional[List[IntegrationSchema]] = []
    billing: Optional[BillingInfoSchema] = None
    notifications: Optional[List[NotificationSchema]] = []
    appearance: Optional[AppearanceSchema] = None
    security: Optional[SecuritySchema] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class UpdateSettingsSchema(BaseModel):
    companyProfile: Optional[CompanyProfileSchema] = None
    users: Optional[List[UserSchema]] = None
    integrations: Optional[List[IntegrationSchema]] = None
    billing: Optional[BillingInfoSchema] = None
    notifications: Optional[List[NotificationSchema]] = None
    appearance: Optional[AppearanceSchema] = None
    security: Optional[SecuritySchema] = None

def settings_helper(settings) -> dict:
    return {
        "id": str(settings.get("_id")),
        "companyProfile": settings.get("companyProfile"),
        "users": settings.get("users", []),
        "integrations": settings.get("integrations", []),
        "billing": settings.get("billing"),
        "notifications": settings.get("notifications", []),
        "appearance": settings.get("appearance"),
        "security": settings.get("security"),
        "createdAt": settings.get("createdAt"),
        "updatedAt": settings.get("updatedAt")
    }
