/**
 * Workflow Editor Component
 * Main visual workflow editor using React Flow
 */

import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  Connection,
  Panel,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflowStore';
import { nodeTypes as importedNodeTypes } from './nodes';
import { edgeTypes as importedEdgeTypes } from './edges';
import NodeConfigPanel from './panels/NodeConfigPanel';
import type { WorkflowNodeType } from '@/types/workflow';

// Define stable objects outside the component to prevent unnecessary re-renders
// and React Flow warnings about unstable references.
const NODE_TYPES = importedNodeTypes;
const EDGE_TYPES = importedEdgeTypes;
const SNAP_GRID: [number, number] = [15, 15];
const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  animated: false,
};

interface WorkflowEditorProps {
  readOnly?: boolean;
}

const WorkflowEditorInner: React.FC<WorkflowEditorProps> = ({ readOnly = false }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    currentWorkflow,
    selectedNodeId,
    selectedEdgeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    duplicateNode,
    copyNode,
    pasteNode,
    deleteEdge,
    setSelectedNode,
    undo,
    redo,
    pushHistory,
  } = useWorkflowStore();

  const nodes = currentWorkflow?.nodes || [];
  const edges = currentWorkflow?.edges || [];

  // Handle node drag stop (push to history)
  const handleNodeDragStop = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || 
                      activeElement?.tagName === 'TEXTAREA' || 
                      (activeElement as HTMLElement)?.isContentEditable;
      
      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? event.metaKey : event.ctrlKey;

      // Undo: Cmd+Z
      if (cmdKey && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if ((cmdKey && event.shiftKey && event.key === 'z') || (cmdKey && event.key === 'y')) {
        event.preventDefault();
        redo();
      }

      // Copy: Cmd+C
      if (cmdKey && event.key === 'c') {
        if (selectedNodeId) {
          event.preventDefault();
          copyNode(selectedNodeId);
        }
      }

      // Paste: Cmd+V
      if (cmdKey && event.key === 'v') {
        event.preventDefault();
        pasteNode();
      }

      // Duplicate: Cmd+D
      if (cmdKey && event.key === 'd') {
        event.preventDefault();
        if (selectedNodeId) {
          duplicateNode(selectedNodeId);
        }
      }

      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          event.preventDefault();
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          event.preventDefault();
          deleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, undo, redo, deleteNode, deleteEdge, duplicateNode, copyNode, pasteNode]);

  // Handle node selection
  const handleNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Handle drag over for dropping new nodes
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop to add new node
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly) return;

      const type = event.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
      if (!type) return;

      // Ensure we have a valid position
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode, readOnly]
  );

  // Handle new connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection);
    },
    [onConnect]
  );

  // MiniMap node color
  const nodeColor = useCallback((node: any) => {
    const colors: Record<string, string> = {
      start: '#22c55e',
      end: '#ef4444',
      agent: '#3b82f6',
      tool: '#f97316',
      condition: '#a855f7',
      llm: '#06b6d4',
      parallel: '#6366f1',
    };
    return colors[node.type] || '#64748b';
  }, []);

  // Find selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  if (!currentWorkflow) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">请选择或创建一个工作流</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={readOnly ? undefined : handleConnect}
            onNodeDragStop={readOnly ? undefined : handleNodeDragStop}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            snapToGrid
            snapGrid={SNAP_GRID}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={true}
            panOnScroll
            zoomOnScroll
            minZoom={0.1}
            maxZoom={1.5}
            className="bg-gray-50/50 dark:bg-gray-950/50"
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={24} 
              size={1.5} 
              color="#e2e8f0" 
              className="dark:!bg-gray-950" 
            />
            <Controls 
              className="!bg-white dark:!bg-gray-900 !border-gray-100 dark:!border-gray-800 !shadow-xl !rounded-xl !overflow-hidden !flex !flex-col !gap-0"
              showZoom
              showFitView
              showInteractive={!readOnly}
            />
            <MiniMap
              nodeColor={nodeColor}
              maskColor="rgba(0, 0, 0, 0.05)"
              className="!bg-white/80 dark:!bg-gray-900/80 !backdrop-blur-md !border-gray-100 dark:!border-gray-800 !rounded-2xl !shadow-2xl"
              style={{ height: 120, width: 180 }}
              zoomable
              pannable
            />

            {/* Validation Errors Panel */}
            <ValidationErrorsPanel />
          </ReactFlow>
        </div>
      </div>

      {/* Right Side Panel - Node Configuration */}
      {!readOnly && selectedNode && (
        <NodeConfigPanel node={selectedNode} />
      )}
    </div>
  );
};

/**
 * Validation Errors Panel
 */
const ValidationErrorsPanel: React.FC = () => {
  const { validationErrors } = useWorkflowStore();

  if (validationErrors.length === 0) return null;

  return (
    <Panel position="bottom-center">
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 max-w-md">
        <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
          验证错误 ({validationErrors.length})
        </h4>
        <ul className="space-y-1">
          {validationErrors.slice(0, 3).map((error, index) => (
            <li key={index} className="text-xs text-red-600 dark:text-red-300">
              • {error.message}
            </li>
          ))}
          {validationErrors.length > 3 && (
            <li className="text-xs text-red-500 dark:text-red-400">
              ... 还有 {validationErrors.length - 3} 个错误
            </li>
          )}
        </ul>
      </div>
    </Panel>
  );
};

/**
 * Workflow Editor with React Flow Provider
 */
const WorkflowEditor: React.FC<WorkflowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;

