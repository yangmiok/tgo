from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.execution import WorkflowExecution, NodeExecution
from app.schemas.execution import WorkflowExecution as WorkflowExecutionSchema, WorkflowExecuteRequest
from celery_app.tasks import execute_workflow_task
from typing import List
import uuid

router = APIRouter()

@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionSchema)
async def execute_workflow(
    workflow_id: str,
    request: WorkflowExecuteRequest,
    db: AsyncSession = Depends(get_db)
):
    # Create execution record
    execution_id = str(uuid.uuid4())
    db_execution = WorkflowExecution(
        id=execution_id,
        workflow_id=workflow_id,
        status="pending",
        input=request.inputs
    )
    db.add(db_execution)
    await db.commit()
    await db.refresh(db_execution)
    
    # Trigger Celery task
    execute_workflow_task.delay(execution_id, workflow_id, request.inputs)
    
    return db_execution

@router.get("/executions/{execution_id}", response_model=WorkflowExecutionSchema)
async def get_execution_status(
    execution_id: str,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(WorkflowExecution)
        .where(WorkflowExecution.id == execution_id)
    )
    result = await db.execute(query)
    execution = result.scalar_one_or_none()
    
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
        
    # Load node executions
    node_query = (
        select(NodeExecution)
        .where(NodeExecution.execution_id == execution_id)
        .order_by(NodeExecution.started_at)
    )
    node_result = await db.execute(node_query)
    execution.node_executions = list(node_result.scalars().all())
    
    return execution

@router.get("/{workflow_id}/executions", response_model=List[WorkflowExecutionSchema])
async def get_workflow_executions(
    workflow_id: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(WorkflowExecution)
        .where(WorkflowExecution.workflow_id == workflow_id)
        .order_by(desc(WorkflowExecution.started_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().all())

