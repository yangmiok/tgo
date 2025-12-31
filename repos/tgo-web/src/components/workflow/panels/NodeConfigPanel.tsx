/**
 * Node Configuration Panel
 * Right-side panel for configuring selected node properties
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Trash2,
  Play,
  Square,
  Bot,
  Wrench,
  GitBranch,
  MessageSquare,
  GitMerge,
  Clock,
  PlusCircle,
  Globe,
  Settings,
  Database,
  Check,
  LayoutGrid,
} from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useAIStore, useKnowledgeStore } from '@/stores';
import { useModelsStore } from '@/stores/modelsStore';
import { useProvidersStore } from '@/stores/providersStore';
import { useProjectToolsStore } from '@/stores/projectToolsStore';
import { VariableInput } from '..';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData } from '@/types/workflow';

interface NodeConfigPanelProps {
  node: WorkflowNode;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  start: Play,
  end: Square,
  agent: Bot,
  tool: Wrench,
  condition: GitBranch,
  llm: MessageSquare,
  parallel: GitMerge,
  api: Globe,
  classifier: LayoutGrid,
};

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node }) => {
  const { t } = useTranslation();
  const { updateNode, deleteNode, setSelectedNode, currentWorkflow } = useWorkflowStore();
  const { agents, loadAgents } = useAIStore();
  const { aiTools, loadMcpTools } = useProjectToolsStore();
  const { knowledgeBases, fetchKnowledgeBases } = useKnowledgeStore();
  const { models, loadModels } = useModelsStore();
  const { providers, loadProviders } = useProvidersStore();

  const nodes = currentWorkflow?.nodes || [];
  const edges = currentWorkflow?.edges || [];

  // Using any here because the node data type changes based on node type
  const [localData, setLocalData] = useState<any>(node.data);

  // Load necessary data
  useEffect(() => {
    if (agents.length === 0) loadAgents().catch(() => {});
    if (aiTools.length === 0) loadMcpTools(false).catch(() => {});
    if (knowledgeBases.length === 0) fetchKnowledgeBases().catch(() => {});
    if (models.length === 0) loadModels().catch(() => {});
    if (providers.length === 0) loadProviders().catch(() => {});
  }, [
    agents.length, loadAgents, 
    aiTools.length, loadMcpTools, 
    knowledgeBases.length, fetchKnowledgeBases,
    models.length, loadModels,
    providers.length, loadProviders
  ]);

  // Sync local data when node changes
  useEffect(() => {
    setLocalData(node.data);
  }, [node.id, node.data]);

  // Update node data
  const handleUpdate = (updates: Record<string, any>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    updateNode(node.id, updates as Partial<WorkflowNodeData>);
  };

  // Delete node
  const handleDelete = () => {
    deleteNode(node.id);
  };

  // Close panel
  const handleClose = () => {
    setSelectedNode(null);
  };

  const nodeType = node.type as string;
  const Icon = iconMap[nodeType] || Play;

  const colorClasses: Record<string, string> = {
    start: 'text-green-600 dark:text-green-400',
    end: 'text-red-600 dark:text-red-400',
    agent: 'text-blue-600 dark:text-blue-400',
    tool: 'text-orange-600 dark:text-orange-400',
    condition: 'text-purple-600 dark:text-purple-400',
    llm: 'text-cyan-600 dark:text-cyan-400',
    parallel: 'text-indigo-600 dark:text-indigo-400',
    api: 'text-blue-600 dark:text-blue-400',
    classifier: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col z-20 shadow-2xl transition-all animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-opacity-10 ${colorClasses[nodeType].replace('text-', 'bg-')} ${colorClasses[nodeType]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {t('workflow.panel.nodeConfig', '节点配置')}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{nodeType}</span>
              {localData.referenceKey && (
                <>
                  <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-[10px] text-blue-500 font-mono font-bold">{localData.referenceKey}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-gray-900">
        {/* Common Fields Section */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {t('workflow.fields.label', '节点名称')}
            </label>
            <input
              type="text"
              value={localData.label || ''}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {t('workflow.fields.description', '备注描述')}
            </label>
            <textarea
              value={localData.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100 resize-none leading-relaxed"
              placeholder="Add some notes about this node..."
            />
          </div>
        </div>

        <div className="h-[1px] bg-gray-50 dark:bg-gray-800" />

        {/* Type-specific fields Section */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Properties</h4>
          
          {node.type === 'start' && (
            <StartNodeConfig data={localData as any} onUpdate={handleUpdate} />
          )}

          {node.type === 'agent' && (
            <AgentNodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              agents={agents} 
            />
          )}

          {node.type === 'tool' && (
            <ToolNodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              tools={aiTools} 
            />
          )}

          {node.type === 'condition' && (
            <ConditionNodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              nodeId={node.id}
              nodes={nodes}
              edges={edges}
              models={models}
              providers={providers}
            />
          )}

          {node.type === 'llm' && (
            <LLMNodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              nodeId={node.id}
              nodes={nodes}
              edges={edges}
              models={models}
              providers={providers}
              tools={aiTools}
              knowledgeBases={knowledgeBases}
            />
          )}

          {node.type === 'parallel' && (
            <ParallelNodeConfig data={localData as any} onUpdate={handleUpdate} />
          )}

          {node.type === 'api' && (
            <APINodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              nodeId={node.id}
              nodes={nodes}
              edges={edges}
            />
          )}

          {node.type === 'classifier' && (
            <ClassifierNodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              nodeId={node.id}
              nodes={nodes}
              edges={edges}
              models={models}
              providers={providers}
            />
          )}

          {node.type === 'end' && (
            <EndNodeConfig 
              data={localData as any} 
              onUpdate={handleUpdate} 
              nodeId={node.id}
              nodes={nodes}
              edges={edges}
            />
          )}
        </div>
      </div>

      {/* Footer - Delete Button */}
      {node.type !== 'start' && node.type !== 'end' && (
        <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 hover:text-white dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-600 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('workflow.actions.deleteNode', '删除节点')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Agent Node Config
const AgentNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  agents: any[];
}> = ({ data, onUpdate, agents }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
          {t('workflow.fields.selectAgent', '关联员工')}
        </label>
        <select
          value={data.agentId || ''}
          onChange={(e) => {
            const agent = agents.find(a => a.id === e.target.value);
            onUpdate({
              agentId: e.target.value,
              agentName: agent?.name || '',
            });
          }}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100 appearance-none cursor-pointer"
        >
          <option value="">{t('workflow.placeholders.selectAgent', '请选择AI员工')}</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Tool Node Config
const ToolNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  tools: any[];
}> = ({ data, onUpdate, tools }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
          {t('workflow.fields.selectTool', '选择工具')}
        </label>
        <select
          value={data.toolId || ''}
          onChange={(e) => {
            const tool = tools.find(t => t.id === e.target.value);
            onUpdate({
              toolId: e.target.value,
              toolName: tool?.name || '',
            });
          }}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100 appearance-none cursor-pointer"
        >
          <option value="">{t('workflow.placeholders.selectTool', '请选择MCP工具')}</option>
          {tools.map(tool => (
            <option key={tool.id} value={tool.id}>
              {tool.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Condition Node Config
const ConditionNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  nodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  models: any[];
  providers: any[];
}> = ({ data, onUpdate, nodeId, nodes, edges, models, providers }) => {
  const { t } = useTranslation();

  const selectedProvider = providers.find(p => p.id === data.providerId);
  const providerModels = models.filter(m => m.provider_id === data.providerId || m.provider === selectedProvider?.kind);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
          {t('workflow.fields.conditionType', '逻辑类型')}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'expression', label: t('workflow.conditionTypes.expression', '代码表达式') },
            { id: 'variable', label: t('workflow.conditionTypes.variable', '变量比较') },
            { id: 'llm', label: t('workflow.conditionTypes.llm', '语义判断 (LLM)') },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => onUpdate({ conditionType: type.id })}
              className={`
                px-4 py-2 text-left text-xs font-semibold rounded-xl border transition-all
                ${data.conditionType === type.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200 dark:hover:border-gray-600'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {data.conditionType === 'expression' && (
        <div className="space-y-2">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
            {t('workflow.fields.expression', 'JS 表达式')}
          </label>
          <VariableInput
            value={data.expression || ''}
            onChange={(val) => onUpdate({ expression: val })}
            nodeId={nodeId}
            nodes={nodes}
            edges={edges}
            placeholder="{{variable}} === 'value'"
            inputClassName="font-mono"
          />
        </div>
      )}

      {data.conditionType === 'variable' && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {t('workflow.fields.variable', '源变量')}
            </label>
            <VariableInput
              value={data.variable || ''}
              onChange={(val) => onUpdate({ variable: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
              inputClassName="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {t('workflow.fields.operator', '关系运算符')}
            </label>
            <select
              value={data.operator || 'equals'}
              onChange={(e) => onUpdate({ operator: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100 appearance-none cursor-pointer"
            >
              <option value="equals">等于 (==)</option>
              <option value="notEquals">不等于 (!=)</option>
              <option value="contains">包含 (contains)</option>
              <option value="greaterThan">大于 (&gt;)</option>
              <option value="lessThan">小于 (&lt;)</option>
              <option value="isEmpty">为空 (null/empty)</option>
              <option value="isNotEmpty">不为空</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {t('workflow.fields.compareValue', '期望值')}
            </label>
            <VariableInput
              value={data.compareValue || ''}
              onChange={(val) => onUpdate({ compareValue: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
            />
          </div>
        </div>
      )}

      {data.conditionType === 'llm' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {t('workflow.fields.llmPrompt', '判断准则')}
            </label>
            <VariableInput
              multiline
              rows={4}
              value={data.llmPrompt || ''}
              onChange={(val) => onUpdate({ llmPrompt: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
              placeholder="描述满足 'Yes' 分支的语义条件..."
            />
          </div>

          <div className="h-[1px] bg-gray-50 dark:bg-gray-800 my-2" />

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">提供商</label>
              <select
                value={data.providerId || ''}
                onChange={(e) => onUpdate({ providerId: e.target.value, modelId: '' })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm cursor-pointer"
              >
                <option value="">选择提供商</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">模型</label>
              <select
                value={data.modelId || ''}
                onChange={(e) => onUpdate({ modelId: e.target.value })}
                disabled={!data.providerId}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm cursor-pointer disabled:opacity-50"
              >
                <option value="">选择模型</option>
                {providerModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name || m.model_id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// LLM Node Config
const LLMNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  nodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  models: any[];
  providers: any[];
  tools: any[];
  knowledgeBases: any[];
}> = ({ data, onUpdate, nodeId, nodes, edges, models, providers, tools, knowledgeBases }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'model' | 'capabilities'>('prompt');

  const selectedProvider = providers.find(p => p.id === data.providerId);
  const providerModels = models.filter(m => m.provider_id === data.providerId || m.provider === selectedProvider?.kind);

  const toggleItem = (field: 'tools' | 'knowledgeBases', id: string) => {
    const list = [...(data[field] || [])];
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id);
    }
    onUpdate({ [field]: list });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        {[
          { id: 'prompt', label: 'Prompt', icon: MessageSquare },
          { id: 'model', label: '模型', icon: Settings },
          { id: 'capabilities', label: '能力', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm border border-gray-100 dark:border-gray-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }
            `}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'prompt' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">系统提示词 (Optional)</label>
            <VariableInput
              multiline
              rows={3}
              value={data.systemPrompt || ''}
              onChange={(val) => onUpdate({ systemPrompt: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
              placeholder="You are a helpful assistant..."
              inputClassName="text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">用户提示词 (User Prompt)</label>
            <VariableInput
              multiline
              rows={6}
              value={data.userPrompt || ''}
              onChange={(val) => onUpdate({ userPrompt: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
              placeholder="Enter instructions for the LLM..."
              inputClassName="font-medium text-xs"
            />
          </div>
        </div>
      )}

      {activeTab === 'model' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">提供商 (Provider)</label>
            <select
              value={data.providerId || ''}
              onChange={(e) => onUpdate({ providerId: e.target.value, modelId: '' })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="">选择提供商</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">模型 (Model)</label>
            <select
              value={data.modelId || ''}
              onChange={(e) => onUpdate({ modelId: e.target.value })}
              disabled={!data.providerId}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">选择模型</option>
              {providerModels.map(m => (
                <option key={m.id} value={m.id}>{m.name || m.model_id}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Temperature</label>
              <input
                type="number"
                value={data.temperature ?? 0.7}
                onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
                min={0}
                max={2}
                step={0.1}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Max Tokens</label>
              <input
                type="number"
                value={data.maxTokens ?? 2000}
                onChange={(e) => onUpdate({ maxTokens: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'capabilities' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Tools */}
          <div className="space-y-3">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
              <Wrench className="w-3 h-3" /> MCP 工具
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => toggleItem('tools', tool.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left
                    ${(data.tools || []).includes(tool.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'
                    }
                  `}
                >
                  <span className="text-xs font-medium truncate">{tool.name}</span>
                  {(data.tools || []).includes(tool.id) && <Check className="w-3 h-3 shrink-0" />}
                </button>
              ))}
              {tools.length === 0 && (
                <div className="text-[10px] text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  暂无可用工具
                </div>
              )}
            </div>
          </div>

          {/* Knowledge Bases */}
          <div className="space-y-3">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
              <Database className="w-3 h-3" /> 知识库 (RAG)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {knowledgeBases.map(kb => (
                <button
                  key={kb.id}
                  onClick={() => toggleItem('knowledgeBases', kb.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left
                    ${(data.knowledgeBases || []).includes(kb.id)
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'
                    }
                  `}
                >
                  <span className="text-xs font-medium truncate">{kb.name}</span>
                  {(data.knowledgeBases || []).includes(kb.id) && <Check className="w-3 h-3 shrink-0" />}
                </button>
              ))}
              {knowledgeBases.length === 0 && (
                <div className="text-[10px] text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  暂无可用知识库
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Parallel Node Config
const ParallelNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
}> = ({ data, onUpdate }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
          {t('workflow.fields.branches', '并发分支数')}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            value={data.branches ?? 2}
            onChange={(e) => onUpdate({ branches: parseInt(e.target.value) })}
            min={2}
            max={10}
            className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-sm font-bold text-indigo-500 w-6">{data.branches ?? 2}</span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        <label htmlFor="waitForAll" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          {t('workflow.fields.waitForAll', '等待全部完成')}
        </label>
        <input
          type="checkbox"
          id="waitForAll"
          checked={data.waitForAll ?? true}
          onChange={(e) => onUpdate({ waitForAll: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
          {t('workflow.fields.timeout', '执行限时 (秒)')}
        </label>
        <input
          type="number"
          value={data.timeout || ''}
          onChange={(e) => onUpdate({ timeout: e.target.value ? parseInt(e.target.value) : undefined })}
          min={1}
          placeholder="∞ 无限制"
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100"
        />
      </div>
    </div>
  );
};

// Classifier Node Config
const ClassifierNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  nodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  models: any[];
  providers: any[];
}> = ({ data, onUpdate, nodeId, nodes, edges, models, providers }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'model'>('config');

  const handleAddCategory = () => {
    const categories = [...(data.categories || [])];
    const id = `cat_${Date.now()}`;
    categories.push({ id, name: `分类 ${categories.length + 1}`, description: '' });
    onUpdate({ categories });
  };

  const handleRemoveCategory = (index: number) => {
    const categories = [...(data.categories || [])];
    categories.splice(index, 1);
    onUpdate({ categories });
  };

  const handleUpdateCategory = (index: number, updates: any) => {
    const categories = [...(data.categories || [])];
    categories[index] = { ...categories[index], ...updates };
    onUpdate({ categories });
  };

  const selectedProvider = providers.find(p => p.id === data.providerId);
  const providerModels = models.filter(m => m.provider_id === data.providerId || m.provider === selectedProvider?.kind);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        {[
          { id: 'config', label: '分类配置', icon: LayoutGrid },
          { id: 'model', label: '推理模型', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm border border-gray-100 dark:border-gray-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }
            `}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">待分类文本</label>
            <VariableInput
              value={data.inputVariable || ''}
              onChange={(val) => onUpdate({ inputVariable: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
              placeholder="选择上游变量，如 {{start_1.user_input}}"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">分类定义 (Categories)</label>
              <button
                onClick={handleAddCategory}
                className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" /> Add Category
              </button>
            </div>

            <div className="space-y-3">
              {(data.categories || []).map((cat: any, i: number) => (
                <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3 relative group">
                  <button
                    onClick={() => handleRemoveCategory(i)}
                    className="absolute right-3 top-3 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Name</label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(i, { name: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400">Description / Rules</label>
                    <textarea
                      value={cat.description || ''}
                      onChange={(e) => handleUpdateCategory(i, { description: e.target.value })}
                      placeholder="描述此分类的特征，LLM将根据此描述进行匹配"
                      rows={2}
                      className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'model' && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">提供商</label>
            <select
              value={data.providerId || ''}
              onChange={(e) => onUpdate({ providerId: e.target.value, modelId: '' })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm cursor-pointer"
            >
              <option value="">选择提供商</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">模型</label>
            <select
              value={data.modelId || ''}
              onChange={(e) => onUpdate({ modelId: e.target.value })}
              disabled={!data.providerId}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl outline-none text-sm cursor-pointer disabled:opacity-50"
            >
              <option value="">选择模型</option>
              {providerModels.map(m => (
                <option key={m.id} value={m.id}>{m.name || m.model_id}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// End Node Config
const EndNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  nodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}> = ({ data, onUpdate, nodeId, nodes, edges }) => {
  const outputTypes = [
    { id: 'variable', label: '变量引用', desc: '引用上游节点的一个输出变量' },
    { id: 'template', label: '文本模板', desc: '使用自定义文本和变量组合' },
    { id: 'structured', label: '结构化数据', desc: '返回 Key-Value 对象' },
  ];

  const handleAddField = () => {
    const list = [...(data.outputStructure || [])];
    list.push({ key: '', value: '' });
    onUpdate({ outputStructure: list });
  };

  const handleRemoveField = (index: number) => {
    const list = [...(data.outputStructure || [])];
    list.splice(index, 1);
    onUpdate({ outputStructure: list });
  };

  const handleUpdateField = (index: number, updates: any) => {
    const list = [...(data.outputStructure || [])];
    list[index] = { ...list[index], ...updates };
    onUpdate({ outputStructure: list });
  };

  return (
    <div className="space-y-6">
      {/* Output Type Selector */}
      <div className="space-y-3">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">输出模式</label>
        <div className="grid grid-cols-1 gap-2">
          {outputTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onUpdate({ outputType: type.id })}
              className={`
                px-4 py-3 text-left rounded-xl border transition-all flex flex-col gap-1
                ${data.outputType === type.id
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200'
                }
              `}
            >
              <div className={`text-xs font-bold ${data.outputType === type.id ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {type.label}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                {type.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-gray-50 dark:bg-gray-800" />

      {/* Type Specific Config */}
      {data.outputType === 'variable' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">选择变量</label>
          <VariableInput
            value={data.outputVariable || ''}
            onChange={(val) => onUpdate({ outputVariable: val })}
            nodeId={nodeId}
            nodes={nodes}
            edges={edges}
            placeholder="final_response"
            inputClassName="font-mono"
          />
        </div>
      )}

      {data.outputType === 'template' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">回复模板</label>
          <VariableInput
            multiline
            rows={6}
            value={data.outputTemplate || ''}
            onChange={(val) => onUpdate({ outputTemplate: val })}
            nodeId={nodeId}
            nodes={nodes}
            edges={edges}
            placeholder="您好，查询到的结果是：{{api_1.body}}"
            inputClassName="text-sm leading-relaxed"
          />
        </div>
      )}

      {data.outputType === 'structured' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">字段定义 (JSON)</label>
            <button
              onClick={handleAddField}
              className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              + Add Field
            </button>
          </div>
          <div className="space-y-2">
            {(data.outputStructure || []).map((field: any, i: number) => (
              <div key={i} className="flex gap-2 items-center group">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => handleUpdateField(i, { key: e.target.value })}
                  placeholder="Key"
                  className="w-24 shrink-0 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono h-9"
                />
                <div className="flex-1 h-9">
                  <VariableInput
                    value={field.value}
                    onChange={(val) => handleUpdateField(i, { value: val })}
                    nodeId={nodeId}
                    nodes={nodes}
                    edges={edges}
                    placeholder="Value"
                    className="h-full"
                    inputClassName="!rounded-xl text-xs"
                  />
                </div>
                <button
                  onClick={() => handleRemoveField(i)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(data.outputStructure || []).length === 0 && (
              <div className="text-center py-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">No fields defined</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// API Node Config
const APINodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
  nodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}> = ({ data, onUpdate, nodeId, nodes, edges }) => {
  const handleAddField = (field: 'headers' | 'params' | 'formData' | 'formUrlEncoded') => {
    const list = [...(data[field] || [])];
    if (field === 'formData') {
      list.push({ key: '', value: '', type: 'text' });
    } else {
      list.push({ key: '', value: '' });
    }
    onUpdate({ [field]: list });
  };

  const handleRemoveField = (field: 'headers' | 'params' | 'formData' | 'formUrlEncoded', index: number) => {
    const list = [...(data[field] || [])];
    list.splice(index, 1);
    onUpdate({ [field]: list });
  };

  const handleUpdateField = (field: 'headers' | 'params' | 'formData' | 'formUrlEncoded', index: number, updates: any) => {
    const list = [...(data[field] || [])];
    list[index] = { ...list[index], ...updates };
    onUpdate({ [field]: list });
  };

  const bodyTypes = [
    { id: 'none', label: 'none' },
    { id: 'json', label: 'JSON' },
    { id: 'form-data', label: 'form-data' },
    { id: 'x-www-form-urlencoded', label: 'x-www-form' },
    { id: 'raw', label: 'raw' },
  ];

  return (
    <div className="space-y-6">
      {/* Method & URL */}
      <div className="space-y-3">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">请求设置</label>
        <div className="flex gap-2">
          <select
            value={data.method || 'GET'}
            onChange={(e) => onUpdate({ method: e.target.value })}
            className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="flex-1">
            <VariableInput
              value={data.url || ''}
              onChange={(val) => onUpdate({ url: val })}
              nodeId={nodeId}
              nodes={nodes}
              edges={edges}
              placeholder="https://api.example.com"
              inputClassName="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Headers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">请求头 (Headers)</label>
          <button
            onClick={() => handleAddField('headers')}
            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            + Add Header
          </button>
        </div>
        <div className="space-y-2">
          {(data.headers || []).map((h: any, i: number) => (
            <div key={i} className="flex gap-2 items-center group">
              <input
                type="text"
                value={h.key}
                onChange={(e) => handleUpdateField('headers', i, { key: e.target.value })}
                placeholder="Name"
                className="w-24 shrink-0 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono h-9"
              />
              <div className="flex-1 h-9">
                <VariableInput
                  value={h.value}
                  onChange={(val) => handleUpdateField('headers', i, { value: val })}
                  nodeId={nodeId}
                  nodes={nodes}
                  edges={edges}
                  placeholder="Value"
                  className="h-full"
                  inputClassName="!rounded-xl text-xs"
                />
              </div>
              <button
                onClick={() => handleRemoveField('headers', i)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Params */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Query 参数</label>
          <button
            onClick={() => handleAddField('params')}
            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            + Add Param
          </button>
        </div>
        <div className="space-y-2">
          {(data.params || []).map((p: any, i: number) => (
            <div key={i} className="flex gap-2 items-center group">
              <input
                type="text"
                value={p.key}
                onChange={(e) => handleUpdateField('params', i, { key: e.target.value })}
                placeholder="Key"
                className="w-24 shrink-0 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono h-9"
              />
              <div className="flex-1 h-9">
                <VariableInput
                  value={p.value}
                  onChange={(val) => handleUpdateField('params', i, { value: val })}
                  nodeId={nodeId}
                  nodes={nodes}
                  edges={edges}
                  placeholder="Value"
                  className="h-full"
                  inputClassName="!rounded-xl text-xs"
                />
              </div>
              <button
                onClick={() => handleRemoveField('params', i)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body Section */}
      {['POST', 'PUT', 'PATCH', 'DELETE'].includes(data.method) && (
        <div className="space-y-4">
          <div className="h-[1px] bg-gray-50 dark:bg-gray-800" />
          <div className="space-y-3">
            <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">请求体 (Body)</label>
            <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              {bodyTypes.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => onUpdate({ bodyType: bt.id })}
                  className={`
                    px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all
                    ${data.bodyType === bt.id
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm border border-gray-100 dark:border-gray-600'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }
                  `}
                >
                  {bt.label}
                </button>
              ))}
            </div>

            {/* JSON Editor */}
            {data.bodyType === 'json' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <VariableInput
                  multiline
                  rows={6}
                  value={data.body || ''}
                  onChange={(val) => onUpdate({ body: val })}
                  nodeId={nodeId}
                  nodes={nodes}
                  edges={edges}
                  placeholder='{ "key": "{{variable}}" }'
                  inputClassName="font-mono text-[11px]"
                />
              </div>
            )}

            {/* Form Data */}
            {data.bodyType === 'form-data' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddField('formData')}
                    className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {(data.formData || []).map((fd: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center group">
                      <input
                        type="text"
                        value={fd.key}
                        onChange={(e) => handleUpdateField('formData', i, { key: e.target.value })}
                        placeholder="Key"
                        className="w-24 shrink-0 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none h-9 font-mono"
                      />
                      <div className="flex-1 h-9">
                        <VariableInput
                          value={fd.value}
                          onChange={(val) => handleUpdateField('formData', i, { value: val })}
                          nodeId={nodeId}
                          nodes={nodes}
                          edges={edges}
                          placeholder="Value"
                          className="h-full"
                          inputClassName="!rounded-xl text-xs"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveField('formData', i)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* x-www-form-urlencoded */}
            {data.bodyType === 'x-www-form-urlencoded' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddField('formUrlEncoded')}
                    className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {(data.formUrlEncoded || []).map((fe: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center group">
                      <input
                        type="text"
                        value={fe.key}
                        onChange={(e) => handleUpdateField('formUrlEncoded', i, { key: e.target.value })}
                        placeholder="Key"
                        className="w-24 shrink-0 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none h-9 font-mono"
                      />
                      <div className="flex-1 h-9">
                        <VariableInput
                          value={fe.value}
                          onChange={(val) => handleUpdateField('formUrlEncoded', i, { value: val })}
                          nodeId={nodeId}
                          nodes={nodes}
                          edges={edges}
                          placeholder="Value"
                          className="h-full"
                          inputClassName="!rounded-xl text-xs"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveField('formUrlEncoded', i)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Editor */}
            {data.bodyType === 'raw' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex gap-2">
                  {['text', 'html', 'xml', 'javascript'].map((rt) => (
                    <button
                      key={rt}
                      onClick={() => onUpdate({ rawType: rt })}
                      className={`
                        px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border transition-all
                        ${data.rawType === rt || (!data.rawType && rt === 'text')
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-gray-100 text-gray-400'
                        }
                      `}
                    >
                      {rt}
                    </button>
                  ))}
                </div>
                <VariableInput
                  multiline
                  rows={6}
                  value={data.body || ''}
                  onChange={(val) => onUpdate({ body: val })}
                  nodeId={nodeId}
                  nodes={nodes}
                  edges={edges}
                  placeholder="Enter raw content..."
                  inputClassName="font-mono text-[11px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Output Info */}
      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/30 space-y-2 mt-4">
        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">默认输出：</div>
        <div className="grid grid-cols-1 gap-1">
          {['body', 'status_code', 'headers'].map(field => (
            <div key={field} className="flex justify-between items-center group">
              <code className="text-[10px] text-blue-500 font-bold">.{field}</code>
              <span className="text-[9px] text-gray-400 italic">可用变量</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Start Node Config
const StartNodeConfig: React.FC<{
  data: any;
  onUpdate: (updates: any) => void;
}> = ({ data, onUpdate }) => {
  const { t } = useTranslation();

  const handleAddInput = () => {
    const inputs = [...(data.inputVariables || [])];
    inputs.push({ name: `input_${inputs.length + 1}`, type: 'string', description: '' });
    onUpdate({ inputVariables: inputs });
  };

  const handleRemoveInput = (index: number) => {
    const inputs = [...(data.inputVariables || [])];
    inputs.splice(index, 1);
    onUpdate({ inputVariables: inputs });
  };

  const handleUpdateInput = (index: number, updates: any) => {
    const inputs = [...(data.inputVariables || [])];
    inputs[index] = { ...inputs[index], ...updates };
    onUpdate({ inputVariables: inputs });
  };

  return (
    <div className="space-y-6">
      {/* Trigger Type */}
      <div className="space-y-3">
        <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
          {t('workflow.fields.triggerType', '触发方式')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'manual', label: t('workflow.triggerTypes.manual', '手动触发'), icon: Play },
            { id: 'cron', label: t('workflow.triggerTypes.cron', '定时触发'), icon: Clock },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => onUpdate({ triggerType: type.id })}
              className={`
                flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl border transition-all
                ${data.triggerType === type.id
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-200 dark:hover:border-gray-600'
                }
              `}
            >
              <type.icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cron Expression */}
      {data.triggerType === 'cron' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
            {t('workflow.fields.cronExpression', 'Cron 表达式')}
          </label>
          <input
            type="text"
            value={data.cronExpression || ''}
            onChange={(e) => onUpdate({ cronExpression: e.target.value })}
            placeholder="0 * * * * (每小时)"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm dark:text-gray-100 font-mono"
          />
          <p className="text-[10px] text-gray-400 italic">
            使用标准 Cron 格式设置自动执行计划。
          </p>
        </div>
      )}

      <div className="h-[1px] bg-gray-50 dark:bg-gray-800" />

      {/* Input Variables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
            {t('workflow.fields.inputVariables', '输入参数')}
          </label>
          <button
            onClick={handleAddInput}
            className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Input
          </button>
        </div>

        <div className="space-y-3">
          {(data.inputVariables || []).map((input: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3 relative group">
              <button
                onClick={() => handleRemoveInput(index)}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400">Name</label>
                  <input
                    type="text"
                    value={input.name}
                    onChange={(e) => handleUpdateInput(index, { name: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400">Type</label>
                  <select
                    value={input.type}
                    onChange={(e) => handleUpdateInput(index, { type: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400">Description</label>
                <input
                  type="text"
                  value={input.description || ''}
                  onChange={(e) => handleUpdateInput(index, { description: e.target.value })}
                  placeholder="What is this input for?"
                  className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}

          {(data.inputVariables || []).length === 0 && (
            <div className="text-center py-6 px-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                No input variables defined.<br />Agents will receive an empty object.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;

