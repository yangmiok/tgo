/**
 * Mock Workflow Data
 * Sample workflows for development and testing
 */

import type { Workflow, WorkflowSummary } from '@/types/workflow';

/**
 * Sample customer service workflow
 */
export const customerServiceWorkflow: Workflow = {
  id: 'wf-001',
  name: '客户咨询处理流程',
  description: '自动处理客户咨询，根据问题类型分配给相应的AI员工或人工客服',
  status: 'active',
  version: 1,
  tags: ['客服', '自动化'],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  nodes: [
    {
      id: 'node-start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: {
        type: 'start',
        label: '开始',
        description: '客户发起咨询',
        triggerType: 'manual',
        referenceKey: 'start_1',
      },
    },
    {
      id: 'node-classify',
      type: 'llm',
      position: { x: 250, y: 150 },
      data: {
        type: 'llm',
        label: '问题分类',
        description: '使用LLM对客户问题进行分类',
        userPrompt: '请分析以下客户问题并分类：{{start_1.user_input}}。分类包括：技术支持、销售咨询、投诉建议、其他。',
        referenceKey: 'classify_1',
      },
    },
    {
      id: 'node-condition',
      type: 'condition',
      position: { x: 250, y: 280 },
      data: {
        type: 'condition',
        label: '判断问题类型',
        conditionType: 'variable',
        variable: 'classify_1.text',
        operator: 'equals',
        compareValue: '技术支持',
        referenceKey: 'condition_1',
      },
    },
    {
      id: 'node-tech-agent',
      type: 'agent',
      position: { x: 100, y: 400 },
      data: {
        type: 'agent',
        label: '技术支持Agent',
        agentId: 'agent-tech-001',
        agentName: '技术支持专员',
        referenceKey: 'tech_agent_1',
      },
    },
    {
      id: 'node-sales-agent',
      type: 'agent',
      position: { x: 400, y: 400 },
      data: {
        type: 'agent',
        label: '销售咨询Agent',
        agentId: 'agent-sales-001',
        agentName: '销售顾问',
        referenceKey: 'sales_agent_1',
      },
    },
    {
      id: 'node-end',
      type: 'end',
      position: { x: 250, y: 520 },
      data: {
        type: 'end',
        label: '结束',
        outputType: 'variable',
        outputVariable: 'tech_agent_1.text',
        referenceKey: 'end_1',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-start',
      target: 'node-classify',
      type: 'smoothstep',
    },
    {
      id: 'edge-2',
      source: 'node-classify',
      target: 'node-condition',
      type: 'smoothstep',
    },
    {
      id: 'edge-3',
      source: 'node-condition',
      target: 'node-tech-agent',
      type: 'smoothstep',
      data: { label: 'true' },
    },
    {
      id: 'edge-4',
      source: 'node-condition',
      target: 'node-sales-agent',
      type: 'smoothstep',
      data: { label: 'false' },
    },
    {
      id: 'edge-5',
      source: 'node-tech-agent',
      target: 'node-end',
      type: 'smoothstep',
    },
    {
      id: 'edge-6',
      source: 'node-sales-agent',
      target: 'node-end',
      type: 'smoothstep',
    },
  ],
};

/**
 * Sample data processing workflow
 */
export const dataProcessingWorkflow: Workflow = {
  id: 'wf-002',
  name: '数据分析流程',
  description: '并行执行多个数据分析任务，汇总结果后生成报告',
  status: 'active',
  version: 2,
  tags: ['数据分析', '报告'],
  createdAt: '2024-01-10T09:00:00Z',
  updatedAt: '2024-01-25T16:00:00Z',
  nodes: [
    {
      id: 'node-start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: {
        type: 'start',
        label: '开始',
        triggerType: 'manual',
        referenceKey: 'start_1',
      },
    },
    {
      id: 'node-parallel',
      type: 'parallel',
      position: { x: 250, y: 150 },
      data: {
        type: 'parallel',
        label: '并行分析',
        branches: 3,
        waitForAll: true,
        referenceKey: 'parallel_1',
      },
    },
    {
      id: 'node-tool-1',
      type: 'tool',
      position: { x: 50, y: 280 },
      data: {
        type: 'tool',
        label: '数据查询',
        toolId: 'tool-db-query',
        toolName: 'Database Query',
        referenceKey: 'db_query_1',
      },
    },
    {
      id: 'node-tool-2',
      type: 'tool',
      position: { x: 250, y: 280 },
      data: {
        type: 'tool',
        label: 'API调用',
        toolId: 'tool-api-call',
        toolName: 'External API',
        referenceKey: 'api_call_1',
      },
    },
    {
      id: 'node-tool-3',
      type: 'tool',
      position: { x: 450, y: 280 },
      data: {
        type: 'tool',
        label: '文件处理',
        toolId: 'tool-file-process',
        toolName: 'File Processor',
        referenceKey: 'file_process_1',
      },
    },
    {
      id: 'node-llm-summary',
      type: 'llm',
      position: { x: 250, y: 400 },
      data: {
        type: 'llm',
        label: '汇总分析',
        userPrompt: '请根据以下数据生成分析报告：\n查询结果：{{db_query_1.result}}\nAPI结果：{{api_call_1.result}}\n文件结果：{{file_process_1.result}}',
        referenceKey: 'summary_1',
      },
    },
    {
      id: 'node-end',
      type: 'end',
      position: { x: 250, y: 520 },
      data: {
        type: 'end',
        label: '结束',
        outputType: 'variable',
        outputVariable: 'summary_1.text',
        referenceKey: 'end_1',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-start',
      target: 'node-parallel',
      type: 'smoothstep',
    },
    {
      id: 'edge-2',
      source: 'node-parallel',
      target: 'node-tool-1',
      type: 'smoothstep',
    },
    {
      id: 'edge-3',
      source: 'node-parallel',
      target: 'node-tool-2',
      type: 'smoothstep',
    },
    {
      id: 'edge-4',
      source: 'node-parallel',
      target: 'node-tool-3',
      type: 'smoothstep',
    },
    {
      id: 'edge-5',
      source: 'node-tool-1',
      target: 'node-llm-summary',
      type: 'smoothstep',
    },
    {
      id: 'edge-6',
      source: 'node-tool-2',
      target: 'node-llm-summary',
      type: 'smoothstep',
    },
    {
      id: 'edge-7',
      source: 'node-tool-3',
      target: 'node-llm-summary',
      type: 'smoothstep',
    },
    {
      id: 'edge-8',
      source: 'node-llm-summary',
      target: 'node-end',
      type: 'smoothstep',
    },
  ],
};

/**
 * Simple greeting workflow (draft)
 */
export const simpleGreetingWorkflow: Workflow = {
  id: 'wf-003',
  name: '简单问候流程',
  description: '简单的自动问候回复流程',
  status: 'draft',
  version: 1,
  tags: ['简单', '问候'],
  createdAt: '2024-01-28T11:00:00Z',
  updatedAt: '2024-01-28T11:00:00Z',
  nodes: [
    {
      id: 'node-start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: {
        type: 'start',
        label: '开始',
        triggerType: 'manual',
        referenceKey: 'start_1',
      },
    },
    {
      id: 'node-llm',
      type: 'llm',
      position: { x: 250, y: 150 },
      data: {
        type: 'llm',
        label: '生成问候',
        userPrompt: '请根据用户的问候语生成一个友好的回复：{{start_1.user_input}}',
        referenceKey: 'llm_1',
      },
    },
    {
      id: 'node-end',
      type: 'end',
      position: { x: 250, y: 280 },
      data: {
        type: 'end',
        label: '结束',
        outputType: 'variable',
        outputVariable: 'llm_1.text',
        referenceKey: 'end_1',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-start',
      target: 'node-llm',
      type: 'smoothstep',
    },
    {
      id: 'edge-2',
      source: 'node-llm',
      target: 'node-end',
      type: 'smoothstep',
    },
  ],
};

/**
 * All mock workflows
 */
export const mockWorkflows: Workflow[] = [
  customerServiceWorkflow,
  dataProcessingWorkflow,
  simpleGreetingWorkflow,
];

/**
 * Get workflow summaries from full workflows
 */
export function getWorkflowSummaries(): WorkflowSummary[] {
  return mockWorkflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    status: workflow.status,
    nodeCount: workflow.nodes.length,
    tags: workflow.tags,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
  }));
}

/**
 * Get a workflow by ID
 */
export function getMockWorkflowById(id: string): Workflow | undefined {
  return mockWorkflows.find(wf => wf.id === id);
}

/**
 * Generate a new workflow ID
 */
export function generateWorkflowId(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create an empty workflow template
 */
export function createEmptyWorkflow(name: string = '新建工作流'): Workflow {
  const now = new Date().toISOString();
  return {
    id: generateWorkflowId(),
    name,
    description: '',
    status: 'draft',
    version: 1,
    tags: [],
    createdAt: now,
    updatedAt: now,
    nodes: [
      {
        id: 'node-start',
        type: 'start',
        position: { x: 250, y: 50 },
        data: {
          type: 'start',
          label: '开始',
          triggerType: 'manual',
          referenceKey: 'start_1',
        },
      },
      {
        id: 'node-end',
        type: 'end',
        position: { x: 250, y: 200 },
        data: {
          type: 'end',
          label: '结束',
          outputType: 'variable',
          referenceKey: 'end_1',
        },
      },
    ],
    edges: [
      {
        id: 'edge-start-end',
        source: 'node-start',
        target: 'node-end',
        type: 'smoothstep',
      },
    ],
  };
}

