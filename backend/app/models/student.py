from sqlalchemy import Column, Integer, String, Text
from backend.app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    degree = Column(String(100), nullable=False)
    skills = Column(Text, nullable=False)
    resume_text = Column(Text, nullable=True)