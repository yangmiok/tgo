import pytest
from app.services.validation_service import ValidationService

def test_validate_valid_workflow():
    definition = {
        "nodes": [
            {"id": "n1", "type": "start", "data": {"label": "Start"}},
            {"id": "n2", "type": "end", "data": {"label": "End"}}
        ],
        "edges": [
            {"source": "n1", "target": "n2"}
        ]
    }
    errors = ValidationService.validate_workflow(definition)
    assert len(errors) == 0

def test_validate_missing_nodes():
    definition = {"nodes": [], "edges": []}
    errors = ValidationService.validate_workflow(definition)
    assert "Workflow must have a start node" in errors
    assert "Workflow must have at least one end node" in errors

def test_validate_unreachable_node():
    definition = {
        "nodes": [
            {"id": "n1", "type": "start", "data": {"label": "Start"}},
            {"id": "n2", "type": "llm", "data": {"label": "LLM"}},
            {"id": "n3", "type": "end", "data": {"label": "End"}}
        ],
        "edges": [
            {"source": "n1", "target": "n3"}
        ]
    }
    errors = ValidationService.validate_workflow(definition)
    assert any("not reachable from start" in e for e in errors)

def test_validate_circular_dependency():
    definition = {
        "nodes": [
            {"id": "n1", "type": "start", "data": {"label": "Start"}},
            {"id": "n2", "type": "llm", "data": {"label": "LLM"}},
            {"id": "n3", "type": "end", "data": {"label": "End"}}
        ],
        "edges": [
            {"source": "n1", "target": "n2"},
            {"source": "n2", "target": "n2"} # Self loop
        ]
    }
    errors = ValidationService.validate_workflow(definition)
    assert "Workflow contains circular dependencies" in errors

