import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Default to SQLite for seamless local execution if PostgreSQL is not supplied
db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bank_system.db"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_file}")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
