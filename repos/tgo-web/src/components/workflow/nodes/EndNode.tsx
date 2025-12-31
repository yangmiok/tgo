/**
 * End Node Component
 * Exit point of a workflow - Minimal Clean Redesign
 */

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Square } from 'lucide-react';
import type { EndNodeData } from '@/types/workflow';

const EndNode: React.FC<NodeProps<EndNodeData>> = ({ data, selected }) => {
  const getOutputSummary = () => {
    switch (data.outputType) {
      case 'variable':
        return data.outputVariable ? `→ ${data.outputVariable}` : '未配置变量';
      case 'template':
        return '→ 文本模板';
      case 'structured':
        return `→ ${data.outputStructure?.length || 0} 个字段`;
      default:
        return 'Workflow End';
    }
  };

  return (
    <div
      className={`
        px-5 py-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border
        flex items-center gap-4 min-w-[200px] transition-all duration-200
        ${selected 
          ? 'border-red-500 ring-4 ring-red-500/10' 
          : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
        }
      `}
    >
      {/* Colored Side Bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 bg-red-500 rounded-r-full" />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white dark:!border-gray-800 !shadow-sm"
      />
      
      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
        <Square className="w-6 h-6" />
      </div>
      
      <div className="min-w-0">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {data.label || '结束'}
        </div>
        <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-0.5 truncate max-w-[120px]">
          {getOutputSummary()}
        </div>
      </div>
    </div>
  );
};

export default memo(EndNode);
