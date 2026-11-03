from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.approval import Approval


router = APIRouter(
    prefix="/approvals",
    tags=["Human Approval"]
)


class ApprovalCreate(BaseModel):
    student_id: int
    job_id: int
    status: str
    reviewer: str = "Placement Officer"
    comments: str = ""


@router.post("/")
def create_approval(
    approval: ApprovalCreate,
    db: Session = Depends(get_db)
):
    allowed_statuses = [
        "Pending",
        "Approved",
        "Rejected"
    ]

    if approval.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid approval status"
        )

    existing = (
        db.query(Approval)
        .filter(
            Approval.student_id == approval.student_id,
            Approval.job_id == approval.job_id
        )
        .first()
    )

    if existing:
        existing.status = approval.status
        existing.reviewer = approval.reviewer
        existing.comments = approval.comments

        db.commit()
        db.refresh(existing)

        return existing

    new_approval = Approval(
        student_id=approval.student_id,
        job_id=approval.job_id,
        status=approval.status,
        reviewer=approval.reviewer,
        comments=approval.comments
    )

    db.add(new_approval)
    db.commit()
    db.refresh(new_approval)

    return new_approval


@router.get("/")
def get_approvals(
    db: Session = Depends(get_db)
):
    return db.query(Approval).all()


@router.get("/{student_id}/{job_id}")
def get_student_approval(
    student_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    approval = (
        db.query(Approval)
        .filter(
            Approval.student_id == student_id,
            Approval.job_id == job_id
        )
        .first()
    )

    if not approval:
        return {
            "student_id": student_id,
            "job_id": job_id,
            "status": "Pending",
            "reviewer": None,
            "comments": None
        }

    return approval