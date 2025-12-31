from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any, Union

class BaseNodeData(BaseModel):
    label: str
    reference_key: str

class InputVariable(BaseModel):
    name: str
    type: Literal["string", "number", "boolean"]
    description: Optional[str] = None

class StartNodeData(BaseNodeData):
    type: Literal["start"] = "start"
    trigger_type: Literal["manual", "cron"]
    cron_expression: Optional[str] = None
    input_variables: List[InputVariable] = []

class OutputField(BaseModel):
    key: str
    value: str

class EndNodeData(BaseNodeData):
    type: Literal["end"] = "end"
    output_type: Literal["variable", "template", "structured"]
    output_variable: Optional[str] = None
    output_template: Optional[str] = None
    output_structure: Optional[List[OutputField]] = None

class LLMNodeData(BaseNodeData):
    type: Literal["llm"] = "llm"
    provider_id: Optional[str] = None
    model_id: Optional[str] = None
    model_name: Optional[str] = None
    system_prompt: Optional[str] = None
    user_prompt: str
    temperature: float = 0.7
    max_tokens: int = 2000
    tools: List[str] = []
    knowledge_bases: List[str] = []

class AgentNodeData(BaseNodeData):
    type: Literal["agent"] = "agent"
    agent_id: str
    agent_name: Optional[str] = None
    input_mapping: Optional[Dict[str, str]] = None

class ToolNodeData(BaseNodeData):
    type: Literal["tool"] = "tool"
    tool_id: str
    tool_name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    input_mapping: Optional[Dict[str, str]] = None

class KeyValue(BaseModel):
    key: str
    value: str

class FormField(BaseModel):
    key: str
    value: str
    type: Literal["text", "file"] = "text"

class APINodeData(BaseNodeData):
    type: Literal["api"] = "api"
    method: Literal["GET", "POST", "PUT", "DELETE", "PATCH"]
    url: str
    headers: List[KeyValue] = []
    params: List[KeyValue] = []
    body_type: Literal["none", "json", "form-data", "x-www-form-urlencoded", "raw"]
    body: Optional[str] = None
    form_data: List[FormField] = []
    form_url_encoded: List[KeyValue] = []
    raw_type: Optional[Literal["text", "html", "xml", "javascript"]] = None

class ConditionNodeData(BaseNodeData):
    type: Literal["condition"] = "condition"
    condition_type: Literal["expression", "variable", "llm"]
    expression: Optional[str] = None
    variable: Optional[str] = None
    operator: Optional[Literal["equals", "notEquals", "contains", "greaterThan", "lessThan", "isEmpty", "isNotEmpty"]] = None
    compare_value: Optional[str] = None
    llm_prompt: Optional[str] = None
    provider_id: Optional[str] = None
    model_id: Optional[str] = None

class Category(BaseModel):
    id: str
    name: str
    description: str

class ClassifierNodeData(BaseNodeData):
    type: Literal["classifier"] = "classifier"
    input_variable: str
    provider_id: Optional[str] = None
    model_id: Optional[str] = None
    categories: List[Category]

class ParallelNodeData(BaseNodeData):
    type: Literal["parallel"] = "parallel"
    branches: int
    wait_for_all: bool = True
    timeout: Optional[int] = None

# Union for validation
WorkflowNodeData = Union[
    StartNodeData, EndNodeData, LLMNodeData, AgentNodeData, 
    ToolNodeData, APINodeData, ConditionNodeData, 
    ClassifierNodeData, ParallelNodeData
]

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any] # We'll validate this manually or using a discriminator

