from typing import Any, Dict, List, Optional
from datetime import datetime
import time

from app.engine.context import ExecutionContext
from app.engine.graph import WorkflowGraph
from app.engine.nodes.registry import get_executor_class
import app.engine.nodes # Import to trigger registration
from app.core.logging import logger

class WorkflowExecutor:
    def __init__(self, workflow_definition: Dict[str, Any]):
        self.graph = WorkflowGraph(
            nodes=workflow_definition.get("nodes", []),
            edges=workflow_definition.get("edges", [])
        )
        self.execution_results = {} # node_id -> output

    async def run(self, inputs: Dict[str, Any], on_node_complete=None) -> Dict[str, Any]:
        """
        Run the workflow with given inputs.
        on_node_complete: callback(node_id, status, input, output, error, duration)
        """
        # 1. Initialize context
        # We need to map inputs to start node's reference key
        start_node = next((n for n in self.graph.nodes.values() if n["type"] == "start"), None)
        if not start_node:
            raise ValueError("Start node not found")
            
        ref_key = start_node["data"].get("reference_key", "start")
        mapped_inputs = {f"{ref_key}.{k}": v for k, v in inputs.items()}
        context = ExecutionContext(mapped_inputs)
        
        # 2. Get execution order
        topo_order = self.graph.get_topo_sort()
        
        # 3. Execute nodes in order
        executed_nodes = set()
        pending_nodes = [topo_order[0]] # Start with the first node in topo order (should be start)
        
        # Note: In a real implementation with branching, topo sort is not enough.
        # We need to follow the edges.
        
        # Simple execution loop following edges
        curr_node_ids = [topo_order[0]]
        
        final_output = None
        
        while curr_node_ids:
            next_node_ids = []
            for node_id in curr_node_ids:
                if node_id in executed_nodes:
                    continue
                    
                node = self.graph.get_node(node_id)
                executor_cls = get_executor_class(node["type"])
                
                if not executor_cls:
                    logger.warning(f"No executor found for node type: {node['type']}")
                    continue
                
                executor = executor_cls(node_id, node)
                
                start_time = time.time()
                status = "completed"
                error = None
                outputs = {}
                next_handle = None
                
                try:
                    outputs, next_handle = await executor.execute_with_timeout(context)
                    context.set_node_outputs(executor.reference_key, outputs)
                    
                    if node["type"] == "end":
                        final_output = outputs.get("result")
                        
                except Exception as e:
                    status = "failed"
                    error = str(e)
                    logger.error(f"Error executing node {node_id}: {e}")
                
                duration = int((time.time() - start_time) * 1000)
                
                if on_node_complete:
                    await on_node_complete(
                        node_id=node_id,
                        node_type=node["type"],
                        status=status,
                        input=node["data"], # Simplified
                        output=outputs,
                        error=error,
                        duration=duration
                    )
                
                executed_nodes.add(node_id)
                
                if status == "completed":
                    # Get next nodes based on handle (for branching)
                    targets = self.graph.get_next_nodes(node_id, next_handle)
                    next_node_ids.extend(targets)
            
            curr_node_ids = list(set(next_node_ids)) # De-duplicate
            
        return final_output

