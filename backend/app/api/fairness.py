from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.student import Student
from backend.app.models.approval import Approval


router = APIRouter(
    prefix="/fairness",
    tags=["Fairness Audit"]
)


@router.get("/audit")
def fairness_audit(
    db: Session = Depends(get_db)
):
    students = db.query(Student).all()
    approvals = db.query(Approval).all()

    total_candidates = len(students)

    approved_ids = {
        approval.student_id
        for approval in approvals
        if approval.status == "Approved"
    }

    approved_candidates = len(approved_ids)

    if total_candidates == 0:
        selection_rate = 0
    else:
        selection_rate = round(
            (approved_candidates / total_candidates) * 100,
            2
        )

    return {
        "audit_type": "Basic Selection Rate Audit",
        "total_candidates": total_candidates,
        "approved_candidates": approved_candidates,
        "selection_rate": selection_rate,
        "sensitive_attributes_used": False,
        "fairness_note": (
            "Sensitive attributes such as name, gender, "
            "caste, religion and photograph are not used "
            "for AI ranking."
        ),
        "human_review_required": True
    }