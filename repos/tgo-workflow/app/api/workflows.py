from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.workflow_service import WorkflowService
from app.services.validation_service import ValidationService
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowInDB, WorkflowSummary
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[WorkflowSummary])
async def get_workflows(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await WorkflowService.get_all(db, skip=skip, limit=limit, status=status)

@router.post("/", response_model=WorkflowInDB, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_in: WorkflowCreate,
    db: AsyncSession = Depends(get_db)
):
    return await WorkflowService.create(db, workflow_in)

@router.get("/{workflow_id}", response_model=WorkflowInDB)
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db)
):
    workflow = await WorkflowService.get_by_id(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=WorkflowInDB)
async def update_workflow(
    workflow_id: str,
    workflow_in: WorkflowUpdate,
    db: AsyncSession = Depends(get_db)
):
    workflow = await WorkflowService.update(db, workflow_id, workflow_in)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db)
):
    success = await WorkflowService.delete(db, workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")

@router.post("/{workflow_id}/duplicate", response_model=WorkflowInDB)
async def duplicate_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db)
):
    workflow = await WorkflowService.duplicate(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/{workflow_id}/validate")
async def validate_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db)
):
    workflow = await WorkflowService.get_by_id(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    errors = ValidationService.validate_workflow(workflow.definition)
    return {"valid": len(errors) == 0, "errors": errors}

