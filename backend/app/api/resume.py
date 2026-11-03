import re
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from pypdf import PdfReader

from backend.app.services.skill_extraction_service import extract_skills


router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


def extract_email(text: str):
    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    return match.group(0) if match else ""


def extract_degree(text: str):
    degree_patterns = [
        r"\bB\.?\s*Tech\b[^\n]*",
        r"\bB\.?\s*E\.?\b[^\n]*",
        r"\bM\.?\s*Tech\b[^\n]*",
        r"\bM\.?\s*E\.?\b[^\n]*",
        r"\bBCA\b[^\n]*",
        r"\bMCA\b[^\n]*",
        r"\bBSc\b[^\n]*",
        r"\bMSc\b[^\n]*",
    ]

    for pattern in degree_patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            degree = match.group(0).strip()

            # Clean common PDF extraction artifacts.
            degree = re.sub(r"\s+", " ", degree)
            degree = degree.replace(")", "")
            degree = degree.replace("(", "")

            # Stop before unrelated resume sections.
            degree = re.split(
                r"\b(?:Laxman Public School|Central Board|CBSE)\b",
                degree,
                flags=re.IGNORECASE
            )[0].strip()

            return degree

    return ""


def extract_professional_summary(text: str):
    """
    Extract only the PROFESSIONAL SUMMARY section
    instead of putting the entire resume into the profile.
    """

    pattern = (
        r"(?:PROFESSIONAL\s+SUMMARY)"
        r"\s*(.*?)"
        r"(?=\n\s*(?:TECHNICAL\s+SKILLS|SKILLS|PROJECTS|"
        r"CERTIFICATIONS|RELEVANT\s+COURSEWORK|EDUCATION)\b|$)"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    summary = match.group(1).strip()

    # Remove unnecessary line breaks caused by PDF extraction.
    summary = re.sub(
        r"\s+",
        " ",
        summary
    )

    # Clean common PDF hyphenation artifacts.
    summary = summary.replace(
        "hands -on",
        "hands-on"
    )

    summary = summary.replace(
        "object -oriented",
        "object-oriented"
    )

    summary = summary.replace(
        "role -based",
        "role-based"
    )

    summary = summary.replace(
        "user -centric",
        "user-centric"
    )

    summary = summary.replace(
        "real -world",
        "real-world"
    )

    return summary.strip()


@router.post("/extract")
async def extract_resume(
    file: UploadFile = File(...)
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a resume PDF."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported."
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        reader = PdfReader(
            BytesIO(file_bytes)
        )

        extracted_pages = []

        for page in reader.pages:
            page_text = page.extract_text() or ""
            extracted_pages.append(page_text)

        resume_text = "\n".join(
            extracted_pages
        ).strip()

        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="No readable text was found in this PDF."
            )

        email = extract_email(resume_text)

        degree = extract_degree(
            resume_text
        )

        skills = extract_skills(
            resume_text
        )

        professional_summary = extract_professional_summary(
            resume_text
        )

        # If no dedicated summary section exists,
        # leave it empty rather than dumping the entire resume.
        return {
            "filename": file.filename,
            "text": professional_summary,
            "email": email,
            "degree": degree,
            "skills": skills,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to process resume: {str(error)}"
        )