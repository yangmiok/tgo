from typing import Any, Dict, Optional, Tuple
from app.engine.nodes.base import BaseNodeExecutor
from app.engine.context import ExecutionContext
from app.engine.nodes.registry import register_node

@register_node("start")
class StartNodeExecutor(BaseNodeExecutor):
    async def execute(self, context: ExecutionContext) -> Tuple[Dict[str, Any], Optional[str]]:
        # Start node doesn't do much except pass initial inputs
        # Context is already initialized with inputs
        input_vars = self.config.get("input_variables", [])
        outputs = {}
        
        for var in input_vars:
            name = var["name"]
            # Value is already in context from initial_inputs
            val = context.get_variable(f"{self.reference_key}.{name}")
            outputs[name] = val
            
        return outputs, None

