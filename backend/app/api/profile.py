from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User

router = APIRouter(prefix="/profile", tags=["Profile"])


class ProfileUpdate(BaseModel):
    degree: str = ""
    skills: str = ""
    resume_text: str = ""


def profile_data(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "degree": user.degree or "",
        "skills": user.skills or "",
        "resume_text": user.resume_text or "",
    }


@router.get("/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return profile_data(user)


@router.put("/{user_id}")
def update_profile(
    user_id: int,
    data: ProfileUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.degree = data.degree
    user.skills = data.skills
    user.resume_text = data.resume_text

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "profile": profile_data(user),
    }