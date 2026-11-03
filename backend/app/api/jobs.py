from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Job

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    required_skills: str


@router.get("/")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()

    return [
        {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "required_skills": job.required_skills or "",
        }
        for job in jobs
    ]


@router.post("/")
def create_job(data: JobCreate, db: Session = Depends(get_db)):
    if not data.title.strip():
        raise HTTPException(status_code=400, detail="Job title is required.")

    if not data.company.strip():
        raise HTTPException(status_code=400, detail="Company is required.")

    if not data.description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    if not data.required_skills.strip():
        raise HTTPException(status_code=400, detail="Required skills are required.")

    job = Job(
        title=data.title.strip(),
        company=data.company.strip(),
        description=data.description.strip(),
        required_skills=data.required_skills.strip(),
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "message": "Job created successfully.",
        "job": {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "required_skills": job.required_skills or "",
        },
    }