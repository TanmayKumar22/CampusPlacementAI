from sqlalchemy import Column, Integer, String, Text
from backend.app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    company = Column(String(150), nullable=False)
    required_skills = Column(Text, nullable=False)
    description = Column(Text, nullable=True)