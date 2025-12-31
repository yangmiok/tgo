import pytest
from app.engine.executor import WorkflowExecutor
import asyncio

@pytest.mark.asyncio
async def test_workflow_executor_run():
    definition = {
        "nodes": [
            {
                "id": "start_1", 
                "type": "start", 
                "data": {"reference_key": "start", "label": "Start", "input_variables": [{"name": "text", "type": "string"}]}
            },
            {
                "id": "end_1", 
                "type": "end", 
                "data": {"reference_key": "end", "label": "End", "output_type": "template", "output_template": "Processed: {{start.text}}"}
            }
        ],
        "edges": [
            {"source": "start_1", "target": "end_1"}
        ]
    }
    
    executor = WorkflowExecutor(definition)
    inputs = {"text": "hello"}
    
    final_output = await executor.run(inputs)
    assert final_output == "Processed: hello"

@pytest.mark.asyncio
async def test_workflow_executor_with_condition():
    definition = {
        "nodes": [
            {
                "id": "start_1", 
                "type": "start", 
                "data": {"reference_key": "start", "label": "Start", "input_variables": [{"name": "val", "type": "number"}]}
            },
            {
                "id": "cond_1",
                "type": "condition",
                "data": {
                    "reference_key": "cond", 
                    "label": "Is Positive?",
                    "condition_type": "expression",
                    "expression": "start['val'] > 0"
                }
            },
            {
                "id": "end_true", 
                "type": "end", 
                "data": {"reference_key": "end_t", "label": "Positive", "output_type": "template", "output_template": "Positive"}
            },
            {
                "id": "end_false", 
                "type": "end", 
                "data": {"reference_key": "end_f", "label": "Negative", "output_type": "template", "output_template": "Negative"}
            }
        ],
        "edges": [
            {"source": "start_1", "target": "cond_1"},
            {"source": "cond_1", "target": "end_true", "sourceHandle": "true"},
            {"source": "cond_1", "target": "end_false", "sourceHandle": "false"}
        ]
    }
    
    # Case 1: Positive
    executor = WorkflowExecutor(definition)
    res = await executor.run({"val": 10})
    assert res == "Positive"
    
    # Case 2: Negative
    executor = WorkflowExecutor(definition)
    res = await executor.run({"val": -5})
    assert res == "Negative"

