from sqlalchemy import Column, Integer, String, Text

from backend.app.database import Base


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, nullable=False)

    job_id = Column(Integer, nullable=False)

    status = Column(
        String(20),
        default="Pending",
        nullable=False
    )

    reviewer = Column(
        String(100),
        nullable=True
    )

    comments = Column(
        Text,
        nullable=True
    )