/**
 * Workflow API Service
 * Handles workflow CRUD operations
 * Currently uses mock data, will be replaced with real API calls
 */

import type {
  Workflow,
  WorkflowSummary,
  WorkflowCreateRequest,
  WorkflowUpdateRequest,
  WorkflowListResponse,
  WorkflowQueryParams,
} from '@/types/workflow';
import {
  mockWorkflows,
  createEmptyWorkflow,
  generateWorkflowId,
} from '@/data/mockWorkflows';

// Simulated delay for mock API calls
const MOCK_DELAY = 300;

// In-memory storage for mock data (allows CRUD operations)
let workflowsStorage: Workflow[] = [...mockWorkflows];

/**
 * Simulate API delay
 */
const delay = (ms: number = MOCK_DELAY): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Workflow API Service Class
 */
export class WorkflowApiService {
  /**
   * Get paginated list of workflows
   */
  static async getWorkflows(params?: WorkflowQueryParams): Promise<WorkflowListResponse> {
    await delay();
    
    let filtered = [...workflowsStorage];
    
    // Filter by status
    if (params?.status) {
      filtered = filtered.filter(wf => wf.status === params.status);
    }
    
    // Filter by search query
    if (params?.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(wf => 
        wf.name.toLowerCase().includes(query) ||
        wf.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by tags
    if (params?.tags && params.tags.length > 0) {
      filtered = filtered.filter(wf => 
        params.tags!.some(tag => wf.tags.includes(tag))
      );
    }
    
    // Pagination
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;
    const total = filtered.length;
    const paginatedData = filtered.slice(offset, offset + limit);
    
    // Convert to summaries
    const summaries: WorkflowSummary[] = paginatedData.map(wf => ({
      id: wf.id,
      name: wf.name,
      description: wf.description,
      status: wf.status,
      nodeCount: wf.nodes.length,
      tags: wf.tags,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
    }));
    
    return {
      data: summaries,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  }

  /**
   * Get a specific workflow by ID
   */
  static async getWorkflow(id: string): Promise<Workflow> {
    await delay();
    
    const workflow = workflowsStorage.find(wf => wf.id === id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }
    
    return { ...workflow };
  }

  /**
   * Create a new workflow
   */
  static async createWorkflow(request: WorkflowCreateRequest): Promise<Workflow> {
    await delay();
    
    const now = new Date().toISOString();
    const newWorkflow: Workflow = {
      id: generateWorkflowId(),
      name: request.name,
      description: request.description || '',
      nodes: request.nodes,
      edges: request.edges,
      status: 'draft',
      version: 1,
      tags: request.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    
    workflowsStorage.unshift(newWorkflow);
    return { ...newWorkflow };
  }

  /**
   * Update an existing workflow
   */
  static async updateWorkflow(id: string, request: WorkflowUpdateRequest): Promise<Workflow> {
    await delay();
    
    const index = workflowsStorage.findIndex(wf => wf.id === id);
    if (index === -1) {
      throw new Error(`Workflow not found: ${id}`);
    }
    
    const existing = workflowsStorage[index];
    const updated: Workflow = {
      ...existing,
      name: request.name ?? existing.name,
      description: request.description ?? existing.description,
      nodes: request.nodes ?? existing.nodes,
      edges: request.edges ?? existing.edges,
      status: request.status ?? existing.status,
      tags: request.tags ?? existing.tags,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    
    workflowsStorage[index] = updated;
    return { ...updated };
  }

  /**
   * Delete a workflow
   */
  static async deleteWorkflow(id: string): Promise<void> {
    await delay();
    
    const index = workflowsStorage.findIndex(wf => wf.id === id);
    if (index === -1) {
      throw new Error(`Workflow not found: ${id}`);
    }
    
    workflowsStorage.splice(index, 1);
  }

  /**
   * Duplicate a workflow
   */
  static async duplicateWorkflow(id: string, newName?: string): Promise<Workflow> {
    await delay();
    
    const original = await this.getWorkflow(id);
    const now = new Date().toISOString();
    
    const duplicate: Workflow = {
      ...original,
      id: generateWorkflowId(),
      name: newName || `${original.name} (副本)`,
      status: 'draft',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    
    workflowsStorage.unshift(duplicate);
    return { ...duplicate };
  }

  /**
   * Create an empty workflow with default nodes
   */
  static async createEmptyWorkflow(name?: string): Promise<Workflow> {
    await delay();
    
    const empty = createEmptyWorkflow(name);
    workflowsStorage.unshift(empty);
    return { ...empty };
  }

  /**
   * Validate a workflow
   */
  static async validateWorkflow(workflow: Workflow): Promise<{ valid: boolean; errors: string[] }> {
    await delay(100);
    
    const errors: string[] = [];
    
    // Check for start node
    const startNodes = workflow.nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push('工作流必须有一个开始节点');
    } else if (startNodes.length > 1) {
      errors.push('工作流只能有一个开始节点');
    }
    
    // Check for end node
    const endNodes = workflow.nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
      errors.push('工作流必须有一个结束节点');
    }
    
    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    workflow.edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    const disconnectedNodes = workflow.nodes.filter(
      n => !connectedNodeIds.has(n.id) && workflow.nodes.length > 1
    );
    if (disconnectedNodes.length > 0) {
      errors.push(`存在未连接的节点: ${disconnectedNodes.map(n => n.data.label).join(', ')}`);
    }
    
    // Check agent nodes have agent selected
    const agentNodes = workflow.nodes.filter(n => n.type === 'agent');
    agentNodes.forEach(node => {
      if (!node.data || !(node.data as any).agentId) {
        errors.push(`Agent节点 "${node.data?.label || node.id}" 未选择AI员工`);
      }
    });
    
    // Check tool nodes have tool selected
    const toolNodes = workflow.nodes.filter(n => n.type === 'tool');
    toolNodes.forEach(node => {
      if (!node.data || !(node.data as any).toolId) {
        errors.push(`工具节点 "${node.data?.label || node.id}" 未选择MCP工具`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get workflows by IDs
   */
  static async getWorkflowsByIds(ids: string[]): Promise<Workflow[]> {
    await delay();
    
    return workflowsStorage.filter(wf => ids.includes(wf.id));
  }

  /**
   * Reset mock data (for testing)
   */
  static resetMockData(): void {
    workflowsStorage = [...mockWorkflows];
  }
}

export default WorkflowApiService;

