/**
 * Start Node Component
 * Entry point of a workflow - Minimal Clean Redesign
 */

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play, Clock } from 'lucide-react';
import type { StartNodeData } from '@/types/workflow';

const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data, selected }) => {
  return (
    <div
      className={`
        px-5 py-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border
        flex items-center gap-4 min-w-[200px] transition-all duration-200
        ${selected 
          ? 'border-green-500 ring-4 ring-green-500/10' 
          : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
        }
      `}
    >
      {/* Colored Side Bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 bg-green-500 rounded-r-full" />

      <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
        {data.triggerType === 'cron' ? <Clock className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </div>
      
      <div className="min-w-0">
        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {data.label || '开始'}
        </div>
        <div className="flex flex-col gap-0.5 mt-0.5">
          {data.triggerType === 'cron' ? (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {data.cronExpression || 'Scheduled'}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              Manual Trigger
            </div>
          )}
          {data.inputVariables && data.inputVariables.length > 0 && (
            <div className="text-[10px] text-blue-500 font-medium">
              {data.inputVariables.length} Inputs defined
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white dark:!border-gray-800 !shadow-sm"
      />
    </div>
  );
};

export default memo(StartNode);
