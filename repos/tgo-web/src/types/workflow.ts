/**
 * Workflow Type Definitions
 * Defines all types related to AI Agent Workflows
 */

import type { Node, Edge } from 'reactflow';

// ============================================================================
// Node Types
// ============================================================================

/**
 * Available workflow node types
 */
export type WorkflowNodeType = 
  | 'start' 
  | 'end' 
  | 'agent' 
  | 'tool' 
  | 'condition' 
  | 'llm' 
  | 'parallel'
  | 'api'
  | 'classifier';

/**
 * Base node data shared by all nodes
 */
export interface BaseNodeData {
  label: string;
  description?: string;
  referenceKey?: string; // Stable English key for variable references, e.g., "llm_1"
}

/**
 * API node data - external HTTP call
 */
export interface APINodeData extends BaseNodeData {
  type: 'api';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: { key: string; value: string }[];
  params?: { key: string; value: string }[];
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
  body?: string; // For json and raw
  formData?: { key: string; value: string; type: 'text' | 'file' }[];
  formUrlEncoded?: { key: string; value: string }[];
  rawType?: 'text' | 'html' | 'xml' | 'javascript';
}

/**
 * Start node data - entry point of workflow
 */
export interface StartNodeData extends BaseNodeData {
  type: 'start';
  triggerType: 'manual' | 'cron';
  cronExpression?: string;
  inputVariables?: { name: string; type: 'string' | 'number' | 'boolean'; description?: string }[];
}

/**
 * End node data - exit point of workflow
 */
export interface EndNodeData extends BaseNodeData {
  type: 'end';
  outputType: 'variable' | 'template' | 'structured';
  outputVariable?: string; // For 'variable' type
  outputTemplate?: string; // For 'template' type
  outputStructure?: { key: string; value: string }[]; // For 'structured' type
}

/**
 * Agent node data - calls another AI Agent
 */
export interface AgentNodeData extends BaseNodeData {
  type: 'agent';
  agentId: string;
  agentName?: string;
  inputMapping?: Record<string, string>;
}

/**
 * Tool node data - executes an MCP tool
 */
export interface ToolNodeData extends BaseNodeData {
  type: 'tool';
  toolId: string;
  toolName?: string;
  config?: Record<string, any>;
  inputMapping?: Record<string, string>;
}

/**
 * Condition node data - branching logic
 */
export interface ConditionNodeData extends BaseNodeData {
  type: 'condition';
  conditionType: 'expression' | 'variable' | 'llm';
  expression?: string;
  variable?: string;
  operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  compareValue?: string;
  llmPrompt?: string;
  providerId?: string;
  modelId?: string;
  modelName?: string;
}

/**
 * LLM node data - direct LLM call
 */
export interface LLMNodeData extends BaseNodeData {
  type: 'llm';
  providerId?: string;
  modelId?: string;
  modelName?: string;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[]; // IDs of selected MCP tools
  knowledgeBases?: string[]; // IDs of selected knowledge bases
}

/**
 * Parallel node data - parallel execution
 */
export interface ParallelNodeData extends BaseNodeData {
  type: 'parallel';
  branches: number;
  waitForAll: boolean;
  timeout?: number;
}

/**
 * Classifier node data - categorizes input using LLM
 */
export interface ClassifierNodeData extends BaseNodeData {
  type: 'classifier';
  inputVariable: string;
  providerId?: string;
  modelId?: string;
  modelName?: string;
  categories: { id: string; name: string; description: string }[];
}

/**
 * Union type for all node data
 */
export type WorkflowNodeData = 
  | StartNodeData 
  | EndNodeData 
  | AgentNodeData 
  | ToolNodeData 
  | ConditionNodeData 
  | LLMNodeData 
  | ParallelNodeData
  | APINodeData
  | ClassifierNodeData;

/**
 * Workflow node extending React Flow Node
 */
export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Edge label for conditional branches
 */
export type EdgeLabel = 'true' | 'false' | 'default' | string;

/**
 * Custom edge data
 */
export interface WorkflowEdgeData {
  label?: EdgeLabel;
  condition?: string;
  priority?: number;
}

/**
 * Workflow edge extending React Flow Edge
 */
export type WorkflowEdge = Edge<WorkflowEdgeData>;

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * Workflow status
 */
export type WorkflowStatus = 'draft' | 'active' | 'archived';

/**
 * Workflow execution status
 */
export type WorkflowExecutionStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

/**
 * Workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: WorkflowStatus;
  version: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Workflow summary for list views
 */
export interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  nodeCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Workflow execution record
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeExecutions: NodeExecution[];
}

/**
 * Individual node execution record
 */
export interface NodeExecution {
  nodeId: string;
  nodeType: WorkflowNodeType;
  status: WorkflowExecutionStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Workflow create request
 */
export interface WorkflowCreateRequest {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tags?: string[];
}

/**
 * Workflow update request
 */
export interface WorkflowUpdateRequest {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  status?: WorkflowStatus;
  tags?: string[];
}

/**
 * Workflow list response
 */
export interface WorkflowListResponse {
  data: WorkflowSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Workflow query parameters
 */
export interface WorkflowQueryParams {
  status?: WorkflowStatus;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// ============================================================================
// Editor Types
// ============================================================================

/**
 * Node palette item for drag and drop
 */
export interface NodePaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: 'basic' | 'ai' | 'logic' | 'external';
}

// ============================================================================
// Editor Types
// ============================================================================

/**
 * Editor state
 */
export interface WorkflowEditorState {
  workflow: Workflow | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDirty: boolean;
  isValid: boolean;
  validationErrors: ValidationError[];
  history: HistoryState[];
  historyIndex: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * History state for undo/redo
 */
export interface HistoryState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  timestamp: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Node type configurations
 */
export const NODE_TYPE_CONFIG: Record<WorkflowNodeType, NodePaletteItem> = {
  start: {
    type: 'start',
    label: '开始',
    description: '工作流入口点',
    icon: 'Play',
    color: 'green',
    category: 'basic',
  },
  end: {
    type: 'end',
    label: '结束',
    description: '工作流出口点',
    icon: 'Square',
    color: 'red',
    category: 'basic',
  },
  agent: {
    type: 'agent',
    label: 'AI Agent',
    description: '调用其他AI员工',
    icon: 'Bot',
    color: 'blue',
    category: 'ai',
  },
  tool: {
    type: 'tool',
    label: 'MCP工具',
    description: '执行MCP工具',
    icon: 'Wrench',
    color: 'orange',
    category: 'external',
  },
  condition: {
    type: 'condition',
    label: '条件判断',
    description: '根据条件分支',
    icon: 'GitBranch',
    color: 'purple',
    category: 'logic',
  },
  llm: {
    type: 'llm',
    label: 'LLM调用',
    description: '直接调用大语言模型',
    icon: 'MessageSquare',
    color: 'cyan',
    category: 'ai',
  },
  parallel: {
    type: 'parallel',
    label: '并行执行',
    description: '并行执行多个分支',
    icon: 'GitMerge',
    color: 'indigo',
    category: 'logic',
  },
  api: {
    type: 'api',
    label: 'API调用',
    description: '执行外部 HTTP 请求',
    icon: 'Globe',
    color: 'blue',
    category: 'external',
  },
  classifier: {
    type: 'classifier',
    label: '问题分类器',
    description: '使用LLM对输入进行分类',
    icon: 'LayoutGrid',
    color: 'orange',
    category: 'logic',
  },
};

/**
 * Default node data by type
 */
export const DEFAULT_NODE_DATA: Record<WorkflowNodeType, WorkflowNodeData> = {
  start: {
    type: 'start',
    label: '开始',
    triggerType: 'manual',
    inputVariables: [],
  },
  end: {
    type: 'end',
    label: '结束',
    outputType: 'variable',
    outputVariable: '',
  },
  agent: {
    type: 'agent',
    label: 'AI Agent',
    agentId: '',
  },
  tool: {
    type: 'tool',
    label: 'MCP工具',
    toolId: '',
  },
  condition: {
    type: 'condition',
    label: '条件判断',
    conditionType: 'expression',
    expression: '',
  },
  llm: {
    type: 'llm',
    label: 'LLM调用',
    userPrompt: '',
    tools: [],
    knowledgeBases: [],
    temperature: 0.7,
    maxTokens: 2000,
  },
  parallel: {
    type: 'parallel',
    label: '并行执行',
    branches: 2,
    waitForAll: true,
  },
  api: {
    type: 'api',
    label: 'API调用',
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    bodyType: 'json',
  },
  classifier: {
    type: 'classifier',
    label: '问题分类器',
    inputVariable: '',
    categories: [
      { id: 'cat_1', name: '分类1', description: '描述该分类的触发条件' },
      { id: 'cat_2', name: '分类2', description: '描述该分类的触发条件' },
    ],
  },
};

