import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Copy } from 'lucide-react';

interface JsonNodeData {
  label: string;
  value: any;
  type: 'object' | 'array' | 'primitive';
  path: string;
  isHighlighted?: boolean;
}

export const JsonNode = memo(({ data }: NodeProps & { data: JsonNodeData }) => {
  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(data.path);
    // You could add a toast notification here
  };

  const renderValue = () => {
    if (data.type === 'primitive') {
      let displayValue = String(data.value);
      if (typeof data.value === 'string') {
        displayValue = `"${data.value}"`;
      } else if (data.value === null) {
        displayValue = 'null';
      } else if (data.value === undefined) {
        displayValue = 'undefined';
      }
      return (
        <div className="text-center">
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs opacity-90 mt-1 break-all">
            {displayValue}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="font-semibold text-sm">{data.label}</div>
        {data.type === 'object' && (
          <div className="text-xs opacity-90 mt-1">
            {Object.keys(data.value || {}).length} keys
          </div>
        )}
        {data.type === 'array' && (
          <div className="text-xs opacity-90 mt-1">
            {(data.value || []).length} items
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative group"
      title={`Path: ${data.path}\nType: ${data.type}\nValue: ${
        data.type === 'primitive'
          ? data.value
          : `${data.type} with ${
              data.type === 'object'
                ? Object.keys(data.value || {}).length
                : (data.value || []).length
            } ${data.type === 'object' ? 'keys' : 'items'}`
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#6B7280',
          border: '2px solid #ffffff',
          width: '10px',
          height: '10px',
        }}
      />

      {/* Node Content */}
      <div className="px-3 py-2 min-w-[100px] max-w-[200px]">
        {renderValue()}
      </div>

      {/* Copy Path Button */}
      <button
        onClick={handleCopyPath}
        className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        title="Copy JSON path"
      >
        <Copy className="h-3 w-3 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#6B7280',
          border: '2px solid #ffffff',
          width: '10px',
          height: '10px',
        }}
      />
    </div>
  );
});

JsonNode.displayName = 'JsonNode';
