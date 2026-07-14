from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func

DATABASE_URL = "sqlite:///./finrelief.db"

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


# ==========================
# User Table
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    total_debt = Column(Integer, default=50000)
    income = Column(Integer, default=30000)

    emi = Column(Integer, default=0)
    interest_rate = Column(Integer, default=0)
    overdue_months = Column(Integer, default=0)

    total_emi_months = Column(Integer, default=0)
    paid_emi_months = Column(Integer, default=0)
    remaining_emi_months = Column(Integer, default=0)


# ==========================
# Financial History Table
# ==========================
class FinancialHistory(Base):
    __tablename__ = "financial_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    total_debt = Column(Integer)
    income = Column(Integer)

    emi = Column(Integer)
    interest_rate = Column(Integer, default=0)
    overdue_months = Column(Integer)

    total_emi_months = Column(Integer)
    paid_emi_months = Column(Integer)
    remaining_emi_months = Column(Integer)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


Base.metadata.create_all(bind=engine)