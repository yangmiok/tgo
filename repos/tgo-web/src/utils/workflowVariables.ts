/**
 * Workflow Variables Utility
 * Logic for calculating available variables from upstream nodes
 */

import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

export interface AvailableVariable {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  variableName: string;
  variableType?: 'string' | 'number' | 'boolean';
  fullPath: string; // e.g., "Start.user_input"
}

/**
 * Find all upstream nodes of a given node
 */
export function getUpstreamNodes(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const upstreamNodes: WorkflowNode[] = [];
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    // Find all edges where target is currentId
    const incomingEdges = edges.filter(edge => edge.target === currentId);
    
    for (const edge of incomingEdges) {
      if (!visited.has(edge.source)) {
        visited.add(edge.source);
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          upstreamNodes.push(sourceNode);
          queue.push(edge.source);
        }
      }
    }
  }

  return upstreamNodes;
}

/**
 * Get all available variables from upstream nodes
 */
export function getAvailableVariables(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Record<string, AvailableVariable[]> {
  const upstreamNodes = getUpstreamNodes(nodeId, nodes, edges);
  const result: Record<string, AvailableVariable[]> = {};

  upstreamNodes.forEach(node => {
    const variables: AvailableVariable[] = [];
    const data = node.data;

    if (node.type === 'start') {
      const startData = data as any;
      const refKey = startData.referenceKey || 'start_1';
      if (startData.inputVariables && Array.isArray(startData.inputVariables)) {
        startData.inputVariables.forEach((v: any) => {
          variables.push({
            nodeId: node.id,
            nodeLabel: data.label || '开始',
            nodeType: 'start',
            variableName: v.name,
            variableType: v.type,
            fullPath: `${refKey}.${v.name}`
          });
        });
      }
    } else if (node.type === 'api') {
      const nodeData = data as any;
      const refKey = nodeData.referenceKey || `api_1`;
      
      // API node defaults to these 3 sub-outputs directly under refKey
      const subFields = [
        { name: 'body', type: 'string', desc: '响应正文' },
        { name: 'status_code', type: 'number', desc: '状态码' },
        { name: 'headers', type: 'object', desc: '响应头' }
      ];

      subFields.forEach(field => {
        variables.push({
          nodeId: node.id,
          nodeLabel: data.label || 'API调用',
          nodeType: 'api',
          variableName: field.name,
          variableType: field.type as any,
          fullPath: `${refKey}.${field.name}`
        });
      });
    } else if (node.type === 'agent') {
      const refKey = (data as any).referenceKey || 'agent_1';
      variables.push({
        nodeId: node.id,
        nodeLabel: data.label || 'AI Agent',
        nodeType: 'agent',
        variableName: 'text',
        fullPath: `${refKey}.text`
      });
    } else if (node.type === 'llm') {
      const refKey = (data as any).referenceKey || 'llm_1';
      variables.push({
        nodeId: node.id,
        nodeLabel: data.label || 'LLM调用',
        nodeType: 'llm',
        variableName: 'text',
        fullPath: `${refKey}.text`
      });
    } else if (node.type === 'tool') {
      const refKey = (data as any).referenceKey || 'tool_1';
      variables.push({
        nodeId: node.id,
        nodeLabel: data.label || 'MCP工具',
        nodeType: 'tool',
        variableName: 'result',
        fullPath: `${refKey}.result`
      });
    } else if (node.type === 'classifier') {
      const refKey = (data as any).referenceKey || 'classifier_1';
      variables.push(
        {
          nodeId: node.id,
          nodeLabel: data.label || '问题分类器',
          nodeType: 'classifier',
          variableName: 'category_id',
          fullPath: `${refKey}.category_id`
        },
        {
          nodeId: node.id,
          nodeLabel: data.label || '问题分类器',
          nodeType: 'classifier',
          variableName: 'category_name',
          fullPath: `${refKey}.category_name`
        }
      );
    }

    if (variables.length > 0) {
      result[node.id] = variables;
    }
  });

  return result;
}

