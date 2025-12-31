/**
 * Custom Edge Component
 * Styled edge with optional labels for conditional branches
 */

import React from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import type { WorkflowEdgeData } from '@/types/workflow';

const CustomEdge: React.FC<EdgeProps<WorkflowEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getLabelColor = () => {
    if (data?.label === 'true' || data?.label === '是') {
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
    }
    if (data?.label === 'false' || data?.label === '否') {
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#3b82f6' : '#94a3b8',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`
              px-2 py-0.5 text-xs font-medium rounded border
              ${getLabelColor()}
            `}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;

