/**
 * Workflow Nodes Index
 * Export all custom node components
 */

export { default as StartNode } from './StartNode';
export { default as EndNode } from './EndNode';
export { default as AgentNode } from './AgentNode';
export { default as ToolNode } from './ToolNode';
export { default as ConditionNode } from './ConditionNode';
export { default as LLMNode } from './LLMNode';
export { default as ParallelNode } from './ParallelNode';
export { default as APINode } from './APINode';
export { default as ClassifierNode } from './ClassifierNode';

import StartNode from './StartNode';
import EndNode from './EndNode';
import AgentNode from './AgentNode';
import ToolNode from './ToolNode';
import ConditionNode from './ConditionNode';
import LLMNode from './LLMNode';
import ParallelNode from './ParallelNode';
import APINode from './APINode';
import ClassifierNode from './ClassifierNode';

/**
 * Node types map for React Flow
 */
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  agent: AgentNode,
  tool: ToolNode,
  condition: ConditionNode,
  llm: LLMNode,
  parallel: ParallelNode,
  api: APINode,
  classifier: ClassifierNode,
};

