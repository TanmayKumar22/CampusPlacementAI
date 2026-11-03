from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Approval, User, Job

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


@router.post("/{student_id}/{job_id}")
def apply_for_job(
    student_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(User.id == student_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    existing = (
        db.query(Approval)
        .filter(
            Approval.student_id == student_id,
            Approval.job_id == job_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already applied for this job."
        )

    application = Approval(
        student_id=student_id,
        job_id=job_id,
        status="Pending",
        reviewer="",
        comments=""
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully.",
        "application": {
            "id": application.id,
            "student_id": application.student_id,
            "job_id": application.job_id,
            "status": application.status
        }
    }


@router.get("/student/{student_id}")
def get_student_applications(
    student_id: int,
    db: Session = Depends(get_db)
):
    applications = (
        db.query(Approval)
        .filter(Approval.student_id == student_id)
        .all()
    )

    result = []

    for application in applications:
        job = db.query(Job).filter(Job.id == application.job_id).first()

        result.append({
            "id": application.id,
            "job_id": application.job_id,
            "job_title": job.title if job else "Unknown Job",
            "company": job.company if job else "",
            "status": application.status,
            "reviewer": application.reviewer or "",
            "comments": application.comments or ""
        })

    return result


@router.get("/job/{job_id}")
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db)
):
    applications = (
        db.query(Approval)
        .filter(Approval.job_id == job_id)
        .all()
    )

    result = []

    for application in applications:
        student = (
            db.query(User)
            .filter(User.id == application.student_id)
            .first()
        )

        result.append({
            "id": application.id,
            "student_id": application.student_id,
            "student_name": student.name if student else "Unknown Student",
            "student_email": student.email if student else "",
            "job_id": application.job_id,
            "status": application.status,
            "reviewer": application.reviewer or "",
            "comments": application.comments or ""
        })

    return result


@router.patch("/{application_id}")
def update_application_status(
    application_id: int,
    status: str,
    reviewer: str = "",
    comments: str = "",
    db: Session = Depends(get_db)
):
    application = (
        db.query(Approval)
        .filter(Approval.id == application_id)
        .first()
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    allowed_statuses = ["Pending", "Approved", "Rejected"]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status."
        )

    application.status = status
    application.reviewer = reviewer
    application.comments = comments

    db.commit()
    db.refresh(application)

    return {
        "message": f"Application {status.lower()} successfully.",
        "application": {
            "id": application.id,
            "status": application.status,
            "reviewer": application.reviewer,
            "comments": application.comments
        }
    }