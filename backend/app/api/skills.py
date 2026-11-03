from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.skill_extraction_service import (
    extract_skills_from_resume
)

router = APIRouter(
    prefix="/skills",
    tags=["NLP Skill Extraction"]
)


class SkillExtractionRequest(BaseModel):
    resume_text: str
    existing_skills: str = ""


@router.post("/extract")
def extract_resume_skills(
    request: SkillExtractionRequest
):
    result = extract_skills_from_resume(
        resume_text=request.resume_text,
        existing_skills=request.existing_skills
    )

    return result