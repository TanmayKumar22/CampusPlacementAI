from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User, Job
from backend.app.services.matching_service import calculate_ai_match


router = APIRouter(
    prefix="/student-match",
    tags=["Student AI Matching"]
)


@router.get("/{student_id}/{job_id}")
def student_ai_match(
    student_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(User.id == student_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    result = calculate_ai_match(
        student.skills or "",
        student.resume_text or "",
        job.required_skills or "",
        job.description or ""
    )

    return {
        "student_id": student.id,
        "student_name": student.name,
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,

        "match_score": result["score"],
        "skill_match": result["skill_match_score"],
        "tfidf_similarity": result["tfidf_similarity"],

        "matched_skills": result["matched_skills"],
        "skill_gap": result["missing_skills"],

        "explanation": (
    f"Your overall match is {result['score']}%. "
    f"You meet {result['skill_match_score']}% of the required skills. "
    f"The system also compared your profile with the job description "
    f"to check how closely your experience matches the role. "
    + (
        f"To improve your match, consider developing: "
        f"{', '.join(result['missing_skills'])}."
        if result["missing_skills"]
        else "You currently meet all the listed technical requirements."
    )
)
    }