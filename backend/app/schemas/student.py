from pydantic import BaseModel, ConfigDict


class StudentCreate(BaseModel):
    name: str
    email: str
    degree: str
    skills: str
    resume_text: str | None = None


class StudentResponse(StudentCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)