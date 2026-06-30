from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from routes.employee import router as EmployeeRouter

from routes.client import router as ClientRouter

from routes.invoice import router as InvoiceRouter

from routes.project import router as ProjectRouter

from routes.proposal import router as ProposalRouter

from routes.expense import router as ExpenseRouter

from routes.payroll_run import router as PayrollRunRouter

from routes.payslip import router as PayslipRouter

from routes.document import router as DocumentRouter

from routes.auth import router as AuthRouter

from routes.analytics import router as AnalyticsRouter

from routes.settings import router as SettingsRouter

from routes.insights import router as InsightsRouter



app = FastAPI()



app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



app.include_router(EmployeeRouter, tags=["Employee"], prefix="/api/employees")

app.include_router(ClientRouter, tags=["Client"], prefix="/api/clients")

app.include_router(InvoiceRouter, tags=["Invoice"], prefix="/api/invoices")

app.include_router(ProjectRouter, tags=["Project"], prefix="/api/projects")

app.include_router(ProposalRouter, tags=["Proposal"], prefix="/api/proposals")

app.include_router(ExpenseRouter, tags=["Expense"], prefix="/api/expenses")

app.include_router(PayrollRunRouter, tags=["PayrollRun"], prefix="/api/payroll-runs")

app.include_router(PayslipRouter, tags=["Payslip"], prefix="/api/payslips")

app.include_router(DocumentRouter, tags=["Document"], prefix="/api/documents")

app.include_router(AuthRouter, tags=["Auth"], prefix="/api/auth")

app.include_router(AnalyticsRouter, tags=["Analytics"], prefix="/api/analytics")

app.include_router(SettingsRouter, tags=["Settings"], prefix="/api/settings")

app.include_router(InsightsRouter, tags=["Insights"], prefix="/api/insights")



@app.get("/", tags=["Root"])

async def read_root():

    return {"message": "Welcome to Boxway API"}

