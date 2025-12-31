from typing import Any, Dict, Optional, Tuple
from app.engine.nodes.base import BaseNodeExecutor
from app.engine.context import ExecutionContext
from app.engine.nodes.registry import register_node

@register_node("agent")
class AgentNodeExecutor(BaseNodeExecutor):
    async def execute(self, context: ExecutionContext) -> Tuple[Dict[str, Any], Optional[str]]:
        agent_id = self.config.get("agent_id")
        # In a real system, you would fetch agent config and execute it
        # ...
        return {"text": f"[Mocked Agent {agent_id} Response]"}, None

