from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import Base, engine, upgrade_users_table
from backend.app.models import Student, Job, Approval, User
from backend.app.api.students import router as students_router
from backend.app.api.jobs import router as jobs_router
from backend.app.api.shortlisting import router as shortlisting_router
from backend.app.api.skills import router as skills_router
from backend.app.api.approvals import router as approvals_router
from backend.app.api.fairness import router as fairness_router
from backend.app.api.auth import router as auth_router
from backend.app.api.profile import router as profile_router
from backend.app.api.resume import router as resume_router
from backend.app.api.student_match import router as student_match_router
from backend.app.api.applications import router as applications_router

Base.metadata.create_all(bind=engine)
upgrade_users_table()

app = FastAPI(
    title="Campus Placement AI",
    description="AI-Based, Explainable and Fair Campus Placement Shortlisting System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students_router)
app.include_router(jobs_router)
app.include_router(shortlisting_router)
app.include_router(skills_router)
app.include_router(approvals_router)
app.include_router(fairness_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
for route in student_match_router.routes:
    app.router.routes.append(route)
for route in applications_router.routes:
    app.router.routes.append(route)

@app.get("/")
def root():
    return {
        "message": "Campus Placement AI API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/database-status")
def database_status():
    return {
        "database": "connected",
        "tables": [
            "students",
            "jobs"
        ]
    }