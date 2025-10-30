'use client';

import {
    addEdge,
    Background,
    Connection,
    Controls,
    Edge,
    MiniMap,
    Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow
} from '@xyflow/react';
import {
    Maximize,
    Moon,
    RefreshCw,
    Search,
    Sun,
    Zap,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import { JsonNode } from './JsonNode';

const nodeTypes = {
  jsonNode: JsonNode,
};

const sampleJson = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
      zipCode: '10001',
    },
    hobbies: ['reading', 'swimming', 'coding'],
    isActive: true,
    metadata: null,
  },
  items: [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Mouse', price: 29.99 },
  ],
};

interface JsonTreeNode extends Node {
  data: {
    label: string;
    value: any;
    type: 'object' | 'array' | 'primitive';
    path: string;
    isHighlighted?: boolean;
  };
}

interface JsonTreeEdge extends Edge {
  id: string;
  source: string;
  target: string;
}

const JsonTreeVisualizerContent: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(sampleJson, null, 2)
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<JsonTreeNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<JsonTreeEdge>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const generateTree = useCallback(
    (
      data: any,
      path = '$',
      parentId = '',
      x = 0,
      y = 0
    ): { nodes: JsonTreeNode[]; edges: JsonTreeEdge[] } => {
      const nodes: JsonTreeNode[] = [];
      const edges: JsonTreeEdge[] = [];
      let nodeId = `${path}_${Math.random()}`;

      const getNodeColor = (type: string) => {
        switch (type) {
          case 'object':
            return '#8B5CF6'; // Purple
          case 'array':
            return '#10B981'; // Green
          case 'primitive':
            return '#F59E0B'; // Orange
          default:
            return '#6B7280'; // Gray
        }
      };

      if (data === null || data === undefined) {
        const node: JsonTreeNode = {
          id: nodeId,
          type: 'jsonNode',
          position: { x, y },
          data: {
            label:
              path.split('.').pop() ||
              path.split('[').pop()?.replace(']', '') ||
              'null',
            value: data,
            type: 'primitive',
            path,
            isHighlighted: false,
          },
          style: {
            background: getNodeColor('primitive'),
            border: '2px solid #ffffff',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '10px',
            minWidth: '100px',
            textAlign: 'center',
          },
        };
        nodes.push(node);
        if (parentId) {
          edges.push({
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep',
            style: { stroke: '#6B7280', strokeWidth: 2 },
          });
        }
        return { nodes, edges };
      }

      if (typeof data === 'object' && !Array.isArray(data)) {
        // Object node
        const node: JsonTreeNode = {
          id: nodeId,
          type: 'jsonNode',
          position: { x, y },
          data: {
            label: path === '$' ? 'root' : path.split('.').pop() || 'object',
            value: data,
            type: 'object',
            path,
            isHighlighted: false,
          },
          style: {
            background: getNodeColor('object'),
            border: '2px solid #ffffff',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '10px',
            minWidth: '120px',
            textAlign: 'center',
          },
        };
        nodes.push(node);

        if (parentId) {
          edges.push({
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep',
            style: { stroke: '#6B7280', strokeWidth: 2 },
          });
        }

        let childIndex = 0;
        Object.entries(data).forEach(([key, value]) => {
          const childPath = `${path}.${key}`;
          const childX = x + (childIndex - Object.keys(data).length / 2) * 200;
          const childY = y + 150;
          const childResult = generateTree(
            value,
            childPath,
            nodeId,
            childX,
            childY
          );
          nodes.push(...childResult.nodes);
          edges.push(...childResult.edges);
          childIndex++;
        });
      } else if (Array.isArray(data)) {
        // Array node
        const node: JsonTreeNode = {
          id: nodeId,
          type: 'jsonNode',
          position: { x, y },
          data: {
            label: `${
              path.split('.').pop() ||
              path.split('[').pop()?.replace(']', '') ||
              'array'
            }[${data.length}]`,
            value: data,
            type: 'array',
            path,
            isHighlighted: false,
          },
          style: {
            background: getNodeColor('array'),
            border: '2px solid #ffffff',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '10px',
            minWidth: '120px',
            textAlign: 'center',
          },
        };
        nodes.push(node);

        if (parentId) {
          edges.push({
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep',
            style: { stroke: '#6B7280', strokeWidth: 2 },
          });
        }

        data.forEach((item, index) => {
          const childPath = `${path}[${index}]`;
          const childX = x + (index - data.length / 2) * 200;
          const childY = y + 150;
          const childResult = generateTree(
            item,
            childPath,
            nodeId,
            childX,
            childY
          );
          nodes.push(...childResult.nodes);
          edges.push(...childResult.edges);
        });
      } else {
        // Primitive node
        const node: JsonTreeNode = {
          id: nodeId,
          type: 'jsonNode',
          position: { x, y },
          data: {
            label:
              path.split('.').pop() ||
              path.split('[').pop()?.replace(']', '') ||
              'value',
            value: data,
            type: 'primitive',
            path,
            isHighlighted: false,
          },
          style: {
            background: getNodeColor('primitive'),
            border: '2px solid #ffffff',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '10px',
            minWidth: '120px',
            textAlign: 'center',
          },
        };
        nodes.push(node);

        if (parentId) {
          edges.push({
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep',
            style: { stroke: '#6B7280', strokeWidth: 2 },
          });
        }
      }

      return { nodes, edges };
    },
    []
  );

  const handleGenerateTree = useCallback(() => {
    setJsonError('');
    setSearchResult('');

    try {
      const parsedJson = JSON.parse(jsonInput);
      const { nodes: newNodes, edges: newEdges } = generateTree(parsedJson);
      setNodes(newNodes);
      setEdges(newEdges);

      // Fit view after generating tree
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.1 });
      }, 100);
    } catch (error) {
      setJsonError('Invalid JSON format. Please check your input.');
    }
  }, [jsonInput, generateTree, setNodes, setEdges, reactFlowInstance]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResult('Please enter a search query');
      return;
    }

    // Reset all highlights
    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data, isHighlighted: false },
      style: {
        ...node.style,
        border: '2px solid #ffffff',
      },
    }));

    // Find matching nodes
    const matchingNodes = updatedNodes.filter((node) =>
      node.data.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingNodes.length > 0) {
      // Highlight matching nodes
      const highlightedNodes = updatedNodes.map((node) => {
        const isMatch = matchingNodes.some((match) => match.id === node.id);
        return {
          ...node,
          data: { ...node.data, isHighlighted: isMatch },
          style: {
            ...node.style,
            border: isMatch ? '3px solid #EF4444' : '2px solid #ffffff',
            boxShadow: isMatch ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
          },
        };
      });

      setNodes(highlightedNodes);
      setSearchResult(`Found ${matchingNodes.length} match(es)`);

      // Pan to first matching node
      const firstMatch = matchingNodes[0];
      reactFlowInstance.setCenter(
        firstMatch.position.x,
        firstMatch.position.y,
        { zoom: 1.2, duration: 800 }
      );
    } else {
      setNodes(updatedNodes);
      setSearchResult('No matches found');
    }
  }, [searchQuery, nodes, setNodes, reactFlowInstance]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResult('');
    const clearedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data, isHighlighted: false },
      style: {
        ...node.style,
        border: '2px solid #ffffff',
        boxShadow: 'none',
      },
    }));
    setNodes(clearedNodes);
  }, [nodes, setNodes]);

  const handleReset = useCallback(() => {
    setJsonInput('');
    setNodes([]);
    setEdges([]);
    setSearchQuery('');
    setSearchResult('');
    setJsonError('');
  }, [setNodes, setEdges]);

  const handleLoadSample = useCallback(() => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setJsonError('');
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleDownloadImage = useCallback(() => {
    // For the actual implementation, you would need to install html2canvas
    // and capture the React Flow canvas. For now, we'll show an alert.
    alert(
      'Download feature - you would need to implement this with html2canvas library to capture the flow as an image'
    );
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0B1220 0%, #2C1A78 100%)',
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderBottomColor: 'rgba(112, 93, 242, 0.3)',
        }}
        className="shadow-sm border-b"
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 style={{ color: '#FFFFFF' }} className="text-2xl font-bold">
              JSON Tree Visualizer
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Node"
                  className="w-80 px-3 py-2 pl-9 pr-9 border rounded-lg text-sm focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(112, 93, 242, 0.3)',
                    color: '#FFFFFF',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search
                  style={{ color: '#B0B3C0' }}
                  className="absolute left-3 top-2.5 h-4 w-4"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1.5 p-1 rounded transition-colors"
                  style={{ backgroundColor: 'rgba(112, 93, 242, 0.2)' }}
                >
                  <Search style={{ color: '#B0B3C0' }} className="h-3 w-3" />
                </button>
              </div>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#FF6A00', color: '#FFFFFF' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => reactFlowInstance.zoomIn()}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(112, 93, 242, 0.2)',
                  color: '#FFFFFF',
                }}
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={() => reactFlowInstance.zoomOut()}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(112, 93, 242, 0.2)',
                  color: '#FFFFFF',
                }}
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                onClick={() => reactFlowInstance.fitView()}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(112, 93, 242, 0.2)',
                  color: '#FFFFFF',
                }}
                title="Fit View"
              >
                <Maximize className="h-5 w-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(112, 93, 242, 0.2)',
                  color: '#FFFFFF',
                }}
                title={
                  isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
                }
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="px-6 pb-3">
            <div
              style={{
                color: searchResult.includes('No matches')
                  ? '#FF6A00'
                  : '#705DF2',
              }}
              className="text-sm"
            >
              {searchResult}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - JSON Input */}
        <div
          style={{
            width: isLeftPanelCollapsed ? '0' : '400px',
            transition: 'width 0.3s ease',
            borderRight: '1px solid rgba(112, 93, 242, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!isLeftPanelCollapsed && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2
                  style={{ color: '#FFFFFF' }}
                  className="text-lg font-semibold"
                >
                  JSON Input
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLoadSample}
                    className="px-3 py-1 text-sm rounded-md transition-colors"
                    style={{
                      backgroundColor: 'rgba(112, 93, 242, 0.2)',
                      color: '#705DF2',
                    }}
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1 px-3 py-1 text-sm rounded-md transition-colors"
                    style={{
                      backgroundColor: 'rgba(255, 106, 0, 0.2)',
                      color: '#FF6A00',
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON here..."
                className="flex-1 p-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(112, 93, 242, 0.3)',
                  color: '#FFFFFF',
                }}
              />

              <div className="mt-4 space-y-3">
                {jsonError && (
                  <div style={{ color: '#FF6A00' }} className="text-sm">
                    {jsonError}
                  </div>
                )}

                <button
                  onClick={handleGenerateTree}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: '#705DF2',
                    color: '#FFFFFF',
                  }}
                >
                  <Zap className="h-4 w-4" />
                  <span>Generate Tree</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
          style={{
            position: 'absolute',
            left: isLeftPanelCollapsed ? '10px' : '390px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            padding: '8px 12px',
            backgroundColor: '#705DF2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'left 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {isLeftPanelCollapsed ? '>' : '<'}
        </button>

        {/* Right Panel - Tree Visualization */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className={isDarkMode ? 'dark' : ''}
          >
            <Background color="rgba(112, 93, 242, 0.1)" />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.data?.type) {
                  case 'object':
                    return '#8B5CF6';
                  case 'array':
                    return '#10B981';
                  case 'primitive':
                    return '#F59E0B';
                  default:
                    return '#6B7280';
                }
              }}
              className={isDarkMode ? 'dark' : ''}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};
export default JsonTreeVisualizerContent;
