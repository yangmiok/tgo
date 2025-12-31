from sqlalchemy import String, JSON, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, List
from app.database import Base
import uuid

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id: Mapped[str] = mapped_column(String, ForeignKey("workflows.id"))
    status: Mapped[str] = mapped_column(String, default="pending")
    input: Mapped[Optional[dict]] = mapped_column(JSON)
    output: Mapped[Optional[dict]] = mapped_column(JSON)
    error: Mapped[Optional[str]] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    duration: Mapped[Optional[int]] = mapped_column(Integer)  # in milliseconds

    # Relationships
    node_executions: Mapped[List["NodeExecution"]] = relationship(back_populates="workflow_execution")

class NodeExecution(Base):
    __tablename__ = "node_executions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    execution_id: Mapped[str] = mapped_column(String, ForeignKey("workflow_executions.id"))
    node_id: Mapped[str] = mapped_column(String, nullable=False)
    node_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending")
    input: Mapped[Optional[dict]] = mapped_column(JSON)
    output: Mapped[Optional[dict]] = mapped_column(JSON)
    error: Mapped[Optional[str]] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    duration: Mapped[Optional[int]] = mapped_column(Integer)

    # Relationships
    workflow_execution: Mapped["WorkflowExecution"] = relationship(back_populates="node_executions")

