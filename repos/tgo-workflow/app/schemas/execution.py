from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class NodeExecutionBase(BaseModel):
    node_id: str
    node_type: str
    status: ExecutionStatus
    input: Optional[Dict[str, Any]] = None
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None

class NodeExecution(NodeExecutionBase):
    id: str
    execution_id: str

    class Config:
        from_attributes = True

class WorkflowExecutionBase(BaseModel):
    workflow_id: str
    status: ExecutionStatus
    input: Optional[Dict[str, Any]] = None
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None

class WorkflowExecution(WorkflowExecutionBase):
    id: str
    node_executions: List[NodeExecution] = []

    class Config:
        from_attributes = True

class WorkflowExecuteRequest(BaseModel):
    inputs: Dict[str, Any] = {}

