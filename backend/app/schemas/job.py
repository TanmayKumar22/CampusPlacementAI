from pydantic import BaseModel, ConfigDict


class JobCreate(BaseModel):
    title: str
    company: str
    required_skills: str
    description: str | None = None


class JobResponse(JobCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)