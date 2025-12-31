from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, desc
from app.models.workflow import Workflow
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate
from typing import List, Optional
import uuid

class WorkflowService:
    @staticmethod
    async def get_all(db: AsyncSession, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Workflow]:
        query = select(Workflow)
        if status:
            query = query.where(Workflow.status == status)
        query = query.order_by(desc(Workflow.updated_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, workflow_id: str) -> Optional[Workflow]:
        query = select(Workflow).where(Workflow.id == workflow_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, workflow_in: WorkflowCreate) -> Workflow:
        definition = {
            "nodes": workflow_in.nodes,
            "edges": [edge.model_dump() for edge in workflow_in.edges]
        }
        db_workflow = Workflow(
            id=str(uuid.uuid4()),
            name=workflow_in.name,
            description=workflow_in.description,
            definition=definition,
            tags=workflow_in.tags,
            status="draft",
            version=1
        )
        db.add(db_workflow)
        await db.flush()
        return db_workflow

    @staticmethod
    async def update(db: AsyncSession, workflow_id: str, workflow_in: WorkflowUpdate) -> Optional[Workflow]:
        workflow = await WorkflowService.get_by_id(db, workflow_id)
        if not workflow:
            return None
        
        update_data = workflow_in.model_dump(exclude_unset=True)
        
        # Handle definition update if nodes or edges are provided
        if "nodes" in update_data or "edges" in update_data:
            nodes = update_data.pop("nodes", workflow.definition.get("nodes", []))
            edges = update_data.pop("edges", workflow.definition.get("edges", []))
            if isinstance(edges, list) and len(edges) > 0 and not isinstance(edges[0], dict):
                edges = [edge.model_dump() if hasattr(edge, "model_dump") else edge for edge in edges]
            workflow.definition = {"nodes": nodes, "edges": edges}
            workflow.version += 1

        for key, value in update_data.items():
            setattr(workflow, key, value)
        
        await db.flush()
        return workflow

    @staticmethod
    async def delete(db: AsyncSession, workflow_id: str) -> bool:
        query = delete(Workflow).where(Workflow.id == workflow_id)
        result = await db.execute(query)
        return result.rowcount > 0

    @staticmethod
    async def duplicate(db: AsyncSession, workflow_id: str) -> Optional[Workflow]:
        original = await WorkflowService.get_by_id(db, workflow_id)
        if not original:
            return None
        
        new_workflow = Workflow(
            id=str(uuid.uuid4()),
            name=f"{original.name} (Copy)",
            description=original.description,
            definition=original.definition.copy(),
            tags=original.tags,
            status="draft",
            version=1
        )
        db.add(new_workflow)
        await db.flush()
        return new_workflow

