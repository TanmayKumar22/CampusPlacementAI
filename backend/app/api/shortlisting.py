from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.student import Student
from backend.app.models.job import Job

from backend.app.services.matching_service import calculate_ai_match

from backend.app.services.recommendation_service import (
    generate_skill_gap_recommendation,
    generate_explanation
)


router = APIRouter(
    prefix="/shortlisting",
    tags=["AI Shortlisting"]
)


@router.get("/job/{job_id}")
def shortlist_students(
    job_id: int,
    db: Session = Depends(get_db)
):
    # Find the selected job
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    # Get all students
    students = db.query(Student).all()

    rankings = []

    # Calculate AI score for every student
    for student in students:

        result = calculate_ai_match(
            student_skills=student.skills,
            resume_text=student.resume_text or "",
            required_skills=job.required_skills,
            job_description=job.description or ""
        )

        # Generate explainable AI information
        explanation = generate_explanation(
            match_score=result["score"],
            skill_match_score=result["skill_match_score"],
            tfidf_similarity=result["tfidf_similarity"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"]
        )

        # Generate skill-gap recommendations
        skill_gap = generate_skill_gap_recommendation(
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"]
        )

        rankings.append({
            "student_id": student.id,
            "student_name": student.name,
            "degree": student.degree,

            "match_score": result["score"],
            "skill_match_score": result["skill_match_score"],
            "tfidf_similarity": result["tfidf_similarity"],

            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],

            "explanation": explanation,
            "skill_gap": skill_gap
        })

    # Sort candidates by AI match score
    rankings.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    # Assign ranking numbers
    for index, candidate in enumerate(
        rankings,
        start=1
    ):
        candidate["rank"] = index

    # Final API response
    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "required_skills": job.required_skills,
        "total_candidates": len(rankings),

        "ranking_method": (
            "Skill Matching + TF-IDF NLP"
        ),

        "rankings": rankings
    }