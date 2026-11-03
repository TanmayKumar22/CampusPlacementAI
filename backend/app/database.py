from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./campus_placement.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def upgrade_users_table():
    with engine.connect() as connection:
        columns = connection.exec_driver_sql(
            "PRAGMA table_info(users)"
        ).fetchall()

        existing_columns = {column[1] for column in columns}

        if "degree" not in existing_columns:
            connection.exec_driver_sql(
                "ALTER TABLE users ADD COLUMN degree VARCHAR(150)"
            )

        if "skills" not in existing_columns:
            connection.exec_driver_sql(
                "ALTER TABLE users ADD COLUMN skills TEXT"
            )

        if "resume_text" not in existing_columns:
            connection.exec_driver_sql(
                "ALTER TABLE users ADD COLUMN resume_text TEXT"
            )

        connection.commit()