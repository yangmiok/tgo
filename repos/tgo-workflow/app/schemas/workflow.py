from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    type: Optional[str] = "smoothstep"
    data: Optional[Dict[str, Any]] = None

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    tags: List[str] = []

class WorkflowCreate(WorkflowBase):
    nodes: List[Dict[str, Any]]
    edges: List[WorkflowEdge]

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[WorkflowEdge]] = None
    status: Optional[WorkflowStatus] = None
    tags: Optional[List[str]] = None

class WorkflowInDB(WorkflowBase):
    id: str
    definition: Dict[str, Any]
    status: WorkflowStatus
    version: int
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkflowSummary(WorkflowBase):
    id: str
    status: WorkflowStatus
    version: int
    updated_at: datetime

    class Config:
        from_attributes = True

