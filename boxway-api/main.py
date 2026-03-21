from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.employee import router as EmployeeRouter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(EmployeeRouter, tags=["Employee"], prefix="/api/employees")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to Boxway API"}
