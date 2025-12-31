'use client';

import { useState, useMemo, useCallback } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { osmNetworkNodes, osmNetworkEdges } from '@/data/osmNetwork';

interface Node {
  x: number;
  y: number;
  id: string;
  isObstacle?: boolean;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

interface PathStep {
  nodeId: string;
  gCost: number;
  hCost: number;
  fCost: number;
}

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface NetworkEdge {
  from: string;
  to: string;
  weight: number;
}

type Algorithm = 'dijkstra' | 'astar';

export default function RoutingAlgorithmsDemo() {
  const [gridSize, setGridSize] = useState(15);
  const [startNode, setStartNode] = useState<Node>({ x: 1, y: 1, id: '1-1' });
  const [endNode, setEndNode] = useState<Node>({ x: 13, y: 13, id: '13-13' });
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('dijkstra');
  const [isRunning, setIsRunning] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<string[]>([]);
  const [stepHistory, setStepHistory] = useState<PathStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [editMode, setEditMode] = useState<'obstacle' | 'start' | 'end'>('obstacle');
  
  // Network demo state
  const [networkStartNode, setNetworkStartNode] = useState<string | null>(null);
  const [networkEndNode, setNetworkEndNode] = useState<string | null>(null);
  const [networkVisitedNodes, setNetworkVisitedNodes] = useState<Set<string>>(new Set());
  const [networkPath, setNetworkPath] = useState<string[]>([]);
  const [networkEditMode, setNetworkEditMode] = useState<'start' | 'end'>('start');
  const [networkVisualizationMode, setNetworkVisualizationMode] = useState<'navigation' | 'weights'>('navigation');
  const [networkEdgesWithWeights, setNetworkEdgesWithWeights] = useState<NetworkEdge[]>(osmNetworkEdges);

  // Generate grid nodes
  const nodes = useMemo(() => {
    const nodeList: Node[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const id = `${x}-${y}`;
        nodeList.push({
          x,
          y,
          id,
          isObstacle: obstacles.has(id),
        });
      }
    }
    return nodeList;
  }, [gridSize, obstacles]);

  // Generate edges (4-directional movement)
  const edges = useMemo(() => {
    const edgeList: Edge[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const id = `${x}-${y}`;
        if (obstacles.has(id)) continue;

        // Right
        if (x < gridSize - 1 && !obstacles.has(`${x + 1}-${y}`)) {
          edgeList.push({ from: id, to: `${x + 1}-${y}`, weight: 1 });
        }
        // Down
        if (y < gridSize - 1 && !obstacles.has(`${x}-${y + 1}`)) {
          edgeList.push({ from: id, to: `${x}-${y + 1}`, weight: 1 });
        }
        // Left
        if (x > 0 && !obstacles.has(`${x - 1}-${y}`)) {
          edgeList.push({ from: id, to: `${x - 1}-${y}`, weight: 1 });
        }
        // Up
        if (y > 0 && !obstacles.has(`${x}-${y - 1}`)) {
          edgeList.push({ from: id, to: `${x}-${y - 1}`, weight: 1 });
        }
      }
    }
    return edgeList;
  }, [gridSize, obstacles]);

  // Heuristic function (Manhattan distance)
  const heuristic = useCallback((nodeId: string, targetId: string): number => {
    const [x1, y1] = nodeId.split('-').map(Number);
    const [x2, y2] = targetId.split('-').map(Number);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }, []);

  // Network graph data - use OSM network
  const networkNodes: NetworkNode[] = useMemo(() => osmNetworkNodes, []);
  

  // Randomize weights function
  const randomizeNetworkWeights = useCallback(() => {
    const randomized = networkEdgesWithWeights.map(edge => ({
      ...edge,
      weight: Math.round((Math.random() * 19 + 1) * 10) / 10 // Random between 1 and 20
    }));
    setNetworkEdgesWithWeights(randomized);
    // Clear path and visited nodes when weights change
    setNetworkVisitedNodes(new Set());
    setNetworkPath([]);
  }, [networkEdgesWithWeights]);

  // Network heuristic (Euclidean distance)
  const networkHeuristic = useCallback((nodeId1: string, nodeId2: string): number => {
    const node1 = networkNodes.find(n => n.id === nodeId1);
    const node2 = networkNodes.find(n => n.id === nodeId2);
    if (!node1 || !node2) return Infinity;
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy) / 50; // Scale down for reasonable heuristic values
  }, [networkNodes]);

  // Helper function to get color based on weight (for weight visualization)
  const getWeightColor = useCallback((weight: number): string => {
    // Normalize weight to 0-1 range (assuming weights are 1-20)
    const normalized = (weight - 1) / 19;
    // Use a color scale: green (low) -> yellow -> orange -> red (high)
    if (normalized < 0.33) {
      // Green to yellow
      const t = normalized / 0.33;
      return `rgb(${Math.round(34 + t * 221)}, ${Math.round(197 + t * 58)}, ${Math.round(94 - t * 94)})`;
    } else if (normalized < 0.66) {
      // Yellow to orange
      const t = (normalized - 0.33) / 0.33;
      return `rgb(${Math.round(255 - t * 45)}, ${Math.round(255 - t * 100)}, ${Math.round(0)})`;
    } else {
      // Orange to red
      const t = (normalized - 0.66) / 0.34;
      return `rgb(${Math.round(255 - t * 45)}, ${Math.round(155 - t * 155)}, ${Math.round(0)})`;
    }
  }, []);

  // Network Dijkstra
  const networkDijkstra = useCallback((startId: string, endId: string) => {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string> = new Map();
    const unvisited = new Set<string>();
    const visited: string[] = [];
    const stepHistory: PathStep[] = [];

    networkNodes.forEach((node) => {
      distances.set(node.id, Infinity);
      unvisited.add(node.id);
    });
    distances.set(startId, 0);

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minDist = Infinity;
      
      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId);
        if (dist !== undefined && dist < minDist) {
          minDist = dist;
          current = nodeId;
        }
      }

      if (!current || minDist === Infinity) break;

      unvisited.delete(current);
      visited.push(current);

      const currentDist = distances.get(current) || 0;
      stepHistory.push({
        nodeId: current,
        gCost: currentDist,
        hCost: 0,
        fCost: currentDist,
      });

      if (current === endId) break;

      const neighbors = networkEdgesWithWeights.filter(e => e.from === current);
      for (const edge of neighbors) {
        if (unvisited.has(edge.to)) {
          const alt = currentDist + edge.weight;
          const currentDistTo = distances.get(edge.to);
          if (currentDistTo === undefined || alt < currentDistTo) {
            distances.set(edge.to, alt);
            previous.set(edge.to, current);
          }
        }
      }
    }

    const path: string[] = [];
    const endDistance = distances.get(endId);
    
    if (endDistance !== undefined && endDistance !== Infinity && visited.includes(endId)) {
      let current: string = endId;
      path.push(current);
      
      while (current !== startId) {
        const prev = previous.get(current);
        if (!prev || prev === current) {
          path.length = 0;
          break;
        }
        path.unshift(prev);
        current = prev;
        
        if (path.length > networkNodes.length) {
          path.length = 0;
          break;
        }
      }
    }

    return { visited, path, stepHistory };
  }, [networkNodes, networkEdgesWithWeights]);

  // Network A*
  const networkAStar = useCallback((startId: string, endId: string) => {
    const openSet = new Set<string>([startId]);
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const previous: Map<string, string | null> = new Map();
    const visited: string[] = [];
    const stepHistory: PathStep[] = [];

    networkNodes.forEach((node) => {
      gScore.set(node.id, Infinity);
      fScore.set(node.id, Infinity);
      previous.set(node.id, null);
    });
    gScore.set(startId, 0);
    fScore.set(startId, networkHeuristic(startId, endId));

    while (openSet.size > 0) {
      let current: string | null = null;
      let minF = Infinity;
      openSet.forEach((nodeId) => {
        const f = fScore.get(nodeId) || Infinity;
        if (f < minF) {
          minF = f;
          current = nodeId;
        }
      });

      if (!current) break;

      if (current === endId) {
        visited.push(current);
        stepHistory.push({
          nodeId: current,
          gCost: gScore.get(current) || 0,
          hCost: networkHeuristic(current, endId),
          fCost: fScore.get(current) || 0,
        });
        break;
      }

      openSet.delete(current);
      closedSet.add(current);
      visited.push(current);

      const g = gScore.get(current) || 0;
      const h = networkHeuristic(current, endId);
      stepHistory.push({
        nodeId: current,
        gCost: g,
        hCost: h,
        fCost: g + h,
      });

      const neighbors = networkEdgesWithWeights.filter(e => e.from === current);
      for (const edge of neighbors) {
        if (closedSet.has(edge.to)) continue;

        const tentativeG = g + edge.weight;

        if (!openSet.has(edge.to)) {
          openSet.add(edge.to);
        } else if (tentativeG >= (gScore.get(edge.to) || Infinity)) {
          continue;
        }

        previous.set(edge.to, current);
        gScore.set(edge.to, tentativeG);
        fScore.set(edge.to, tentativeG + networkHeuristic(edge.to, endId));
      }
    }

    const path: string[] = [];
    let current: string | null = endId;
    while (current) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    return { visited, path, stepHistory };
  }, [networkNodes, networkEdgesWithWeights, networkHeuristic]);

  const handleNetworkNodeClick = (nodeId: string) => {
    if (networkEditMode === 'start') {
      setNetworkStartNode(nodeId);
      setNetworkVisitedNodes(new Set());
      setNetworkPath([]);
    } else {
      setNetworkEndNode(nodeId);
      setNetworkVisitedNodes(new Set());
      setNetworkPath([]);
    }
  };

  const handleNetworkRunAlgorithm = () => {
    if (!networkStartNode || !networkEndNode) return;
    
    // Switch back to navigation mode when running algorithm
    setNetworkVisualizationMode('navigation');
    setNetworkVisitedNodes(new Set());
    setNetworkPath([]);

    const result = selectedAlgorithm === 'dijkstra'
      ? networkDijkstra(networkStartNode, networkEndNode)
      : networkAStar(networkStartNode, networkEndNode);

    setNetworkVisitedNodes(new Set(result.visited));
    setNetworkPath(result.path);
  };

  // Dijkstra's algorithm
  const dijkstra = useCallback((startId: string, endId: string) => {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string> = new Map();
    const unvisited = new Set<string>();
    const visited: string[] = [];
    const stepHistory: PathStep[] = [];

    // Check if start or end are obstacles
    const startNode = nodes.find(n => n.id === startId);
    const endNode = nodes.find(n => n.id === endId);
    if (startNode?.isObstacle || endNode?.isObstacle) {
      return { visited, path: [], stepHistory };
    }

    // Handle case where start == end
    if (startId === endId) {
      return { visited: [startId], path: [startId], stepHistory: [{
        nodeId: startId,
        gCost: 0,
        hCost: 0,
        fCost: 0,
      }] };
    }

    // Initialize distances - only for non-obstacle nodes
    nodes.forEach((node) => {
      if (!node.isObstacle) {
        distances.set(node.id, Infinity);
        unvisited.add(node.id);
      }
    });
    distances.set(startId, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance from unvisited set
      let current: string | null = null;
      let minDist = Infinity;
      
      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId);
        if (dist !== undefined && dist < minDist) {
          minDist = dist;
          current = nodeId;
        }
      }

      // If no reachable nodes found, break
      if (!current || minDist === Infinity) break;

      // Remove current from unvisited and add to visited
      unvisited.delete(current);
      visited.push(current);

      const currentDist = distances.get(current) || 0;
      stepHistory.push({
        nodeId: current,
        gCost: currentDist,
        hCost: 0,
        fCost: currentDist,
      });

      // If we reached the end, we can stop
      if (current === endId) break;

      // Update distances to neighbors
      const neighbors = edges.filter(e => e.from === current);
      for (const edge of neighbors) {
        if (unvisited.has(edge.to)) {
          const alt = currentDist + edge.weight;
          const currentDistTo = distances.get(edge.to);
          if (currentDistTo === undefined || alt < currentDistTo) {
            distances.set(edge.to, alt);
            previous.set(edge.to, current);
          }
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    const endDistance = distances.get(endId);
    
    // Check if end was reached (distance is not Infinity)
    if (endDistance !== undefined && endDistance !== Infinity && visited.includes(endId)) {
      // Reconstruct path by following previous pointers backwards from end
      let current: string = endId;
      path.push(current);
      
      while (current !== startId) {
        const prev = previous.get(current);
        if (!prev || prev === current) {
          // No path found or cycle detected
          path.length = 0;
          break;
        }
        path.unshift(prev);
        current = prev;
        
        // Safety check to prevent infinite loops
        if (path.length > nodes.length) {
          path.length = 0;
          break;
        }
      }
    }

    return { visited, path, stepHistory };
  }, [nodes, edges]);

  // A* algorithm
  const astar = useCallback(
    (startId: string, endId: string) => {
      const openSet = new Set<string>([startId]);
      const closedSet = new Set<string>();
      const gScore = new Map<string, number>();
      const fScore = new Map<string, number>();
      const previous: Map<string, string | null> = new Map();
      const visited: string[] = [];
      const stepHistory: PathStep[] = [];

      // Initialize scores
      nodes.forEach((node) => {
        if (!node.isObstacle) {
          gScore.set(node.id, Infinity);
          fScore.set(node.id, Infinity);
          previous.set(node.id, null);
        }
      });
      gScore.set(startId, 0);
      fScore.set(startId, heuristic(startId, endId));

      while (openSet.size > 0) {
        // Find node with lowest fScore
        let current: string | null = null;
        let minF = Infinity;
        openSet.forEach((nodeId) => {
          const f = fScore.get(nodeId) || Infinity;
          if (f < minF) {
            minF = f;
            current = nodeId;
          }
        });

        if (!current) break;

        if (current === endId) {
          visited.push(current);
          stepHistory.push({
            nodeId: current,
            gCost: gScore.get(current) || 0,
            hCost: heuristic(current, endId),
            fCost: fScore.get(current) || 0,
          });
          break;
        }

        openSet.delete(current);
        closedSet.add(current);
        visited.push(current);

        const g = gScore.get(current) || 0;
        const h = heuristic(current, endId);
        stepHistory.push({
          nodeId: current,
          gCost: g,
          hCost: h,
          fCost: g + h,
        });

        // Check neighbors
        edges
          .filter((e) => e.from === current)
          .forEach((edge) => {
            if (closedSet.has(edge.to)) return;

            const tentativeG = g + edge.weight;

            if (!openSet.has(edge.to)) {
              openSet.add(edge.to);
            } else if (tentativeG >= (gScore.get(edge.to) || Infinity)) {
              return;
            }

            previous.set(edge.to, current!);
            gScore.set(edge.to, tentativeG);
            fScore.set(edge.to, tentativeG + heuristic(edge.to, endId));
          });
      }

      // Reconstruct path
      const path: string[] = [];
      let current: string | null = endId;
      while (current) {
        path.unshift(current);
        current = previous.get(current) || null;
      }

      return { visited, path, stepHistory };
    },
    [nodes, edges, heuristic]
  );

  const handleRunAlgorithm = useCallback(() => {
    setIsRunning(true);
    setVisitedNodes(new Set());
    setPath([]);
    setStepHistory([]);
    setCurrentStep(0);

    const startId = `${startNode.x}-${startNode.y}`;
    const endId = `${endNode.x}-${endNode.y}`;

    const result =
      selectedAlgorithm === 'dijkstra'
        ? dijkstra(startId, endId)
        : astar(startId, endId);

    setStepHistory(result.stepHistory);
    setVisitedNodes(new Set(result.visited));
    setPath(result.path);
    setIsRunning(false);
  }, [selectedAlgorithm, startNode, endNode, dijkstra, astar]);

  const handleCellClick = (x: number, y: number) => {
    const id = `${x}-${y}`;
    const startId = `${startNode.x}-${startNode.y}`;
    const endId = `${endNode.x}-${endNode.y}`;

    if (editMode === 'start') {
      if (id === endId || obstacles.has(id)) return;
      setStartNode({ x, y, id });
      setVisitedNodes(new Set());
      setPath([]);
      setStepHistory([]);
    } else if (editMode === 'end') {
      if (id === startId || obstacles.has(id)) return;
      setEndNode({ x, y, id });
      setVisitedNodes(new Set());
      setPath([]);
      setStepHistory([]);
    } else {
      // Obstacle mode
      if (id === startId || id === endId) return;
      const newObstacles = new Set(obstacles);
      if (newObstacles.has(id)) {
        newObstacles.delete(id);
      } else {
        newObstacles.add(id);
      }
      setObstacles(newObstacles);
      setVisitedNodes(new Set());
      setPath([]);
      setStepHistory([]);
    }
  };

  const clearObstacles = () => {
    setObstacles(new Set());
    setVisitedNodes(new Set());
    setPath([]);
    setStepHistory([]);
  };

  const resetGrid = () => {
    setStartNode({ x: 1, y: 1, id: '1-1' });
    setEndNode({ x: gridSize - 2, y: gridSize - 2, id: `${gridSize - 2}-${gridSize - 2}` });
    setObstacles(new Set());
    setVisitedNodes(new Set());
    setPath([]);
    setStepHistory([]);
  };

  const cellSize = Math.min(500 / gridSize, 30);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Routing Algorithms: Dijkstra vs A*</h1>
        <p className="text-lg text-gray-700">
          Compare Dijkstra's algorithm and A* pathfinding. Both find optimal paths, but A* uses heuristics to explore more efficiently.
        </p>
      </div>

      {/* Dijkstra's Algorithm Detailed Explanation */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dijkstra's Algorithm</h2>
        
        {/* Introduction */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-700 mb-3">
            This page provides an interactive exploration of Dijkstra's algorithm, one of the most fundamental pathfinding 
            algorithms in computer science and transportation engineering. You can compare Dijkstra's algorithm with A* 
            pathfinding, visualize how each algorithm explores the search space, and experiment with different network 
            configurations. The page includes detailed explanations, step-by-step algorithm walkthroughs, and a real-world 
            research application demonstrating how Dijkstra's algorithm was used to identify the safest routes in urban 
            transportation networks.
          </p>
          <p className="text-gray-700">
            Use the interactive grid below to set obstacles, start and end points, and watch how the algorithms find optimal 
            paths. The network visualization demonstrates how these algorithms work on real transportation networks with 
            customizable impedance functions.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-700 mb-3">
              Dijkstra's algorithm, developed by Dutch computer scientist Edsger W. Dijkstra in 1956, is a fundamental 
              graph search algorithm that finds the shortest path from a source node to all other nodes in a weighted graph. 
              It guarantees finding the optimal path when all edge weights are non-negative.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-700 mb-3">
              The algorithm maintains a set of unvisited nodes and iteratively selects the node with the minimum distance 
              from the start. For each selected node, it updates the distances to its neighbors if a shorter path is found.
            </p>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Algorithm Steps:</p>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li><strong>Initialize:</strong> Set distance to start node as 0, all other nodes as Infinity</li>
                <li><strong>Select:</strong> Choose the unvisited node with the smallest distance</li>
                <li><strong>Mark:</strong> Mark the selected node as visited</li>
                <li><strong>Update:</strong> For each neighbor of the selected node, calculate tentative distance. If smaller than current distance, update it</li>
                <li><strong>Repeat:</strong> Continue until the destination is reached or all reachable nodes are visited</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Key Properties:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li><strong>Greedy:</strong> Always selects the closest unvisited node</li>
                <li><strong>Optimal:</strong> Guarantees shortest path when all weights are non-negative</li>
                <li><strong>Complete:</strong> Will find a path if one exists</li>
                <li><strong>Time Complexity:</strong> O(V²) for dense graphs, O((V + E) log V) with priority queue</li>
                <li><strong>Space Complexity:</strong> O(V) for storing distances and previous nodes</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Limitations:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Does not use information about the goal location, exploring uniformly in all directions</li>
                <li>May explore many unnecessary nodes, especially when the goal is far from the start</li>
                <li>Requires non-negative edge weights (cannot handle negative cycles)</li>
                <li>For large graphs, the uniform exploration can be inefficient</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Impedance Functions</h3>
            <p className="text-gray-700 mb-3">
              In transportation routing, <strong>impedance functions</strong> define the cost (or "impedance") of traversing 
              a link in the network. Unlike simple distance-based routing, impedance functions can incorporate multiple 
              factors that affect route choice:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-3">
              <li><strong>Travel Time:</strong> Time required to traverse the link, accounting for speed limits, 
              traffic conditions, and signal delays</li>
              <li><strong>Crash Risk:</strong> Safety-related impedance based on historical crash data, conflict rates, 
              or real-time risk estimates</li>
              <li><strong>Multi-objective:</strong> Weighted combinations of multiple factors (e.g., 
              <InlineMath math="w = \alpha \cdot time + \beta \cdot risk" />)</li>
            </ul>
            <p className="text-gray-700 mb-3">
              By modifying the impedance function, the same routing algorithm can optimize for different objectives—fastest 
              route (time-based), shortest route (distance-based), or safest route (risk-based)—simply by changing how 
              link weights are calculated.
            </p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Key Insight:</strong> The impedance function determines what "optimal" means for the routing problem. 
                Dijkstra's algorithm will find the path that minimizes the sum of impedance values along the route, regardless 
                of whether those values represent distance, time, risk, or a combination of factors.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Route Reconstruction</h3>
            <p className="text-gray-700 mb-3">
              After Dijkstra's algorithm completes and finds the optimal distances to all nodes, we need to reconstruct the 
              actual path from the start node to the destination. This is done by tracing backwards from the destination using 
              the <strong>previous node pointers</strong> that were maintained during the algorithm's execution.
            </p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Route Reconstruction Steps:</p>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li><strong>Start at destination:</strong> Begin with the destination node</li>
                <li><strong>Trace backwards:</strong> Follow the previous node pointer to find which node led to the current node</li>
                <li><strong>Build path:</strong> Add each node to the path as we trace backwards</li>
                <li><strong>Stop at start:</strong> Continue until we reach the start node</li>
                <li><strong>Reverse path:</strong> Since we built the path backwards, reverse it to get the correct order from start to destination</li>
              </ol>
            </div>
            <p className="text-gray-700 mb-3">
              During the algorithm's execution, whenever we update a node's distance, we also record which node we came from 
              (the "previous" node). This creates a chain of nodes that can be followed backwards from any destination to 
              reconstruct the optimal path. If no path exists (the destination was never reached), the distance to the 
              destination will remain Infinity, indicating that no route is possible.
            </p>
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <p className="text-sm text-gray-700">
                <strong>Example:</strong> If the previous pointers show D ← C ← B ← A, then the reconstructed path from A to D 
                is A → B → C → D, with a total cost equal to the distance stored for node D.
              </p>
            </div>
          </div>

          {/* Example Dijkstra - Moved to bottom */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-3">Example Dijkstra</p>
            <div className="flex justify-center mb-4">
              <svg width="500" height="350" viewBox="0 0 500 350" className="border border-gray-300 rounded bg-white">
                {/* Arrow marker definition */}
                <defs>
                  <marker id="static-arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
                  </marker>
                </defs>
                
                {/* Edges/Links with weights */}
                <line x1="100" y1="100" x2="200" y2="100" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="150" y="90" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">5</text>
                
                <line x1="200" y1="100" x2="300" y2="100" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="250" y="90" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">3</text>
                
                <line x1="300" y1="100" x2="400" y2="100" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="350" y="90" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">4</text>
                
                <line x1="200" y1="100" x2="200" y2="200" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="210" y="150" textAnchor="start" fontSize="14" fontWeight="600" fill="#374151">7</text>
                
                <line x1="300" y1="100" x2="300" y2="200" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="310" y="150" textAnchor="start" fontSize="14" fontWeight="600" fill="#374151">2</text>
                
                <line x1="200" y1="200" x2="300" y2="200" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="250" y="210" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">6</text>
                
                <line x1="100" y1="100" x2="100" y2="200" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="90" y="150" textAnchor="end" fontSize="14" fontWeight="600" fill="#374151">8</text>
                
                <line x1="100" y1="200" x2="200" y2="200" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#static-arrowhead)" />
                <text x="150" y="210" textAnchor="middle" fontSize="14" fontWeight="600" fill="#374151">4</text>
                
                {/* Nodes */}
                <circle cx="100" cy="100" r="20" fill="#10b981" stroke="#059669" strokeWidth="2" />
                <text x="100" y="107" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">A</text>
                
                <circle cx="200" cy="100" r="20" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
                <text x="200" y="107" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">B</text>
                
                <circle cx="300" cy="100" r="20" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
                <text x="300" y="107" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">C</text>
                
                <circle cx="400" cy="100" r="20" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                <text x="400" y="107" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">D</text>
                
                <circle cx="100" cy="200" r="20" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
                <text x="100" y="207" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">E</text>
                
                <circle cx="200" cy="200" r="20" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
                <text x="200" y="207" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">F</text>
                
                <circle cx="300" cy="200" r="20" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
                <text x="300" y="207" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">G</text>
              </svg>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Example Path Calculation:</strong> To go from A to D, Dijkstra's algorithm would evaluate paths like:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>A → B → C → D (total weight: 5 + 3 + 4 = 12)</li>
                <li>A → E → F → C → D (total weight: 8 + 4 + 6 + 4 = 22)</li>
                <li>A → B → F → G → C → D (total weight: 5 + 7 + 6 + 2 + 4 = 24)</li>
              </ul>
              <p className="mt-2">
                The algorithm selects the path with minimum total weight: <strong>A → B → C → D</strong> (weight = 12).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* A* Algorithm Detailed Explanation */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">A* Algorithm</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-700 mb-3">
              A* (pronounced "A-star") is an informed search algorithm that combines the best features of Dijkstra's algorithm 
              and greedy best-first search. It uses a heuristic function to guide the search toward the goal, making it more 
              efficient than Dijkstra's while still guaranteeing optimality.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-700 mb-3">
              A* maintains two sets: an open set (nodes to be evaluated) and a closed set (nodes already evaluated). 
              It uses a cost function <InlineMath math="f(n) = g(n) + h(n)" /> where:
            </p>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li><strong>g(n):</strong> The actual cost from the start node to node n (known distance)</li>
                <li><strong>h(n):</strong> The heuristic estimate of the cost from node n to the goal (estimated distance)</li>
                <li><strong>f(n):</strong> The total estimated cost of the path through n (f = g + h)</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Algorithm Steps:</p>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li><strong>Initialize:</strong> Add start node to open set with f(start) = h(start)</li>
                <li><strong>Select:</strong> Choose the node from open set with the lowest f-score</li>
                <li><strong>Check:</strong> If selected node is the goal, reconstruct and return path</li>
                <li><strong>Expand:</strong> Move node to closed set and examine its neighbors</li>
                <li><strong>Update:</strong> For each neighbor, calculate tentative g-score. If better than previous, update scores and set previous pointer</li>
                <li><strong>Repeat:</strong> Continue until goal is found or open set is empty</li>
                <li><strong>Reconstruct:</strong> Trace back from goal using previous pointers</li>
              </ol>
            </div>

            <div className="bg-green-50 p-4 rounded border border-green-200 mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Key Properties:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li><strong>Admissible Heuristic:</strong> If h(n) never overestimates the true cost to goal, A* guarantees optimality</li>
                <li><strong>Consistent Heuristic:</strong> If h(n) ≤ cost(n, n') + h(n') for all neighbors n', the heuristic is consistent</li>
                <li><strong>Efficient:</strong> Typically explores fewer nodes than Dijkstra by focusing search toward the goal</li>
                <li><strong>Optimal:</strong> Guarantees shortest path when using an admissible heuristic</li>
                <li><strong>Time Complexity:</strong> O(b^d) where b is branching factor, d is depth of solution (worst case)</li>
                <li><strong>Space Complexity:</strong> O(b^d) for storing all nodes in memory</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Heuristic Functions:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li><strong>Manhattan Distance:</strong> Used in grid-based pathfinding: |x₁ - x₂| + |y₁ - y₂|</li>
                <li><strong>Euclidean Distance:</strong> Straight-line distance: √((x₁ - x₂)² + (y₁ - y₂)²)</li>
                <li><strong>Chebyshev Distance:</strong> Maximum of absolute differences: max(|x₁ - x₂|, |y₁ - y₂|)</li>
                <li>The quality of the heuristic directly affects A*'s efficiency - better heuristics lead to fewer explored nodes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Algorithm
            </label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => {
                setSelectedAlgorithm(e.target.value as Algorithm);
                setVisitedNodes(new Set());
                setPath([]);
                setStepHistory([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="astar">A* Algorithm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grid Size: {gridSize}×{gridSize}
            </label>
            <input
              type="range"
              min="10"
              max="25"
              value={gridSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setGridSize(newSize);
                setStartNode({ x: 1, y: 1, id: '1-1' });
                setEndNode({ x: newSize - 2, y: newSize - 2, id: `${newSize - 2}-${newSize - 2}` });
                setObstacles(new Set());
                setVisitedNodes(new Set());
                setPath([]);
              }}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edit Mode
          </label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setEditMode('obstacle')}
              className={`px-4 py-2 rounded-md transition-colors ${
                editMode === 'obstacle'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Obstacle
            </button>
            <button
              onClick={() => setEditMode('start')}
              className={`px-4 py-2 rounded-md transition-colors ${
                editMode === 'start'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Start
            </button>
            <button
              onClick={() => setEditMode('end')}
              className={`px-4 py-2 rounded-md transition-colors ${
                editMode === 'end'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              End
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleRunAlgorithm}
            disabled={isRunning}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run {selectedAlgorithm === 'dijkstra' ? "Dijkstra's" : 'A*'}
          </button>
          <button
            onClick={clearObstacles}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear Obstacles
          </button>
          <button
            onClick={resetGrid}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Reset Grid
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Select an edit mode (Obstacle, Start, or End)</li>
            <li>Click cells on the grid to place obstacles, set start, or set end</li>
            <li>Click the same cell again in obstacle mode to remove it</li>
          </ul>
        </div>
      </div>

      {/* Grid Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pathfinding Visualization</h2>
        <div className="flex justify-center">
          <div
            className="grid gap-0 border-2 border-gray-800"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
              width: `${gridSize * cellSize}px`,
            }}
          >
            {nodes.map((node) => {
              const nodeId = node.id;
              const isStart = nodeId === `${startNode.x}-${startNode.y}`;
              const isEnd = nodeId === `${endNode.x}-${endNode.y}`;
              const isObstacle = obstacles.has(nodeId);
              const isVisited = visitedNodes.has(nodeId);
              const isPath = path.includes(nodeId);

              let bgColor = 'bg-white';
              if (isObstacle) bgColor = 'bg-gray-900';
              else if (isStart) bgColor = 'bg-green-500';
              else if (isEnd) bgColor = 'bg-red-500';
              else if (isPath) bgColor = 'bg-yellow-400';
              else if (isVisited) bgColor = 'bg-blue-300';

              return (
                <div
                  key={nodeId}
                  className={`${bgColor} border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity`}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  onClick={() => handleCellClick(node.x, node.y)}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border border-gray-300"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 border border-gray-300"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300 border border-gray-300"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 border border-gray-300"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 border border-gray-300"></div>
            <span>Obstacle</span>
          </div>
        </div>
        {path.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-gray-700">
              <strong>Path found!</strong> Length: {path.length - 1} steps. 
              Nodes explored: {visitedNodes.size}
            </p>
          </div>
        )}
        {path.length === 0 && visitedNodes.size > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-gray-700">
              <strong>No path found.</strong> Nodes explored: {visitedNodes.size}
            </p>
          </div>
        )}
      </div>

      {/* Step-by-step details */}
      {stepHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Algorithm Steps</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Node</th>
                  {selectedAlgorithm === 'astar' && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">g-cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">h-cost</th>
                    </>
                  )}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {selectedAlgorithm === 'astar' ? 'f-cost' : 'Distance'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stepHistory.slice(0, 50).map((step, idx) => (
                  <tr key={idx} className={path.includes(step.nodeId) ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900">{step.nodeId}</td>
                    {selectedAlgorithm === 'astar' && (
                      <>
                        <td className="px-4 py-2 text-sm text-gray-600">{step.gCost.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{step.hCost.toFixed(2)}</td>
                      </>
                    )}
                    <td className="px-4 py-2 text-sm text-gray-600">{step.fCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stepHistory.length > 50 && (
              <p className="mt-2 text-sm text-gray-500">Showing first 50 of {stepHistory.length} steps</p>
            )}
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Differences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dijkstra</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Explores uniformly in all directions</li>
              <li>No knowledge of goal location</li>
              <li>May explore many unnecessary nodes</li>
              <li>Simple to implement</li>
              <li>Uses only actual path cost</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">A*</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Guided search toward the goal</li>
              <li>Uses heuristic to prioritize promising nodes</li>
              <li>Typically explores fewer nodes</li>
              <li>Requires good heuristic function</li>
              <li>Combines actual cost with heuristic estimate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Research Application */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Research Application: Safest Route Identification</h2>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            In our research on real-time safest route identification (
            <a 
              href="https://doi.org/10.1016/j.amar.2023.100277" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Ghoul et al., 2023
            </a>
            ), we applied Dijkstra's algorithm to identify the safest paths in urban transportation networks. 
            We chose Dijkstra's algorithm because the network size was relatively small, making the uniform 
            exploration approach computationally feasible while guaranteeing optimal solutions.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Node-Link Representation</h3>
            <p className="text-gray-700 mb-3">
              Transportation networks are typically represented using a <strong>node-link</strong> (or node-edge) 
              graph structure, where:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-3">
              <li><strong>Nodes:</strong> Represent intersections, junctions, or key points in the network (e.g., 
              traffic signals, major intersections, or network centroids)</li>
              <li><strong>Links (Edges):</strong> Represent road segments connecting nodes (e.g., street segments, 
              highway sections, or network arcs)</li>
              <li><strong>Weights:</strong> Each link has associated attributes such as distance, travel time, crash risk, 
              or other impedance measures</li>
            </ul>
            
            {/* Interactive Network Demo */}
            <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Interactive Traffic Network Demo</p>
              
              {/* Network Controls */}
              <div className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setNetworkEditMode('start')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      networkEditMode === 'start'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Set Start
                  </button>
                  <button
                    onClick={() => setNetworkEditMode('end')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      networkEditMode === 'end'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Set End
                  </button>
                  <button
                    onClick={handleNetworkRunAlgorithm}
                    disabled={!networkStartNode || !networkEndNode}
                    className="px-3 py-1 rounded text-sm bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Run {selectedAlgorithm === 'dijkstra' ? "Dijkstra's" : 'A*'}
                  </button>
                  <button
                    onClick={() => {
                      setNetworkVisualizationMode('weights');
                      setNetworkVisitedNodes(new Set());
                      setNetworkPath([]);
                    }}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      networkVisualizationMode === 'weights'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    Show Weights
                  </button>
                  <button
                    onClick={randomizeNetworkWeights}
                    className="px-3 py-1 rounded text-sm bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Randomize Weights
                  </button>
                  <button
                    onClick={() => {
                      setNetworkStartNode(null);
                      setNetworkEndNode(null);
                      setNetworkVisitedNodes(new Set());
                      setNetworkPath([]);
                      setNetworkVisualizationMode('navigation');
                    }}
                    className="px-3 py-1 rounded text-sm bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Reset
                  </button>
                </div>
                {networkStartNode && (
                  <p className="text-xs text-gray-600">Start: Node {networkStartNode}</p>
                )}
                {networkEndNode && (
                  <p className="text-xs text-gray-600">End: Node {networkEndNode}</p>
                )}
                {networkPath.length > 0 && (
                  <p className="text-xs text-green-700 font-semibold">
                    Path found: {networkPath.join(' → ')} (Total weight: {
                      networkPath.slice(0, -1).reduce((sum, node, idx) => {
                        const edge = networkEdgesWithWeights.find(e => e.from === node && e.to === networkPath[idx + 1]);
                        return sum + (edge?.weight || 0);
                      }, 0).toFixed(1)
                    })
                  </p>
                )}
              </div>

              {/* Network Visualization */}
              <div className="flex justify-center overflow-auto">
                <svg width="800" height="600" viewBox="0 0 800 600" className="border border-gray-300 rounded bg-white">
                  {/* Edges/Links - rendered first so nodes appear on top */}
                  {networkEdgesWithWeights.map((edge, idx) => {
                    const fromNode = networkNodes.find(n => n.id === edge.from);
                    const toNode = networkNodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const isInPath = networkPath.includes(edge.from) && networkPath.includes(edge.to) &&
                      networkPath.indexOf(edge.to) === networkPath.indexOf(edge.from) + 1;
                    const isVisited = networkVisitedNodes.has(edge.from) || networkVisitedNodes.has(edge.to);
                    
                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2;
                    const offsetX = (toNode.y - fromNode.y) / 10;
                    const offsetY = (fromNode.x - toNode.x) / 10;

                    // Determine stroke color based on visualization mode
                    let strokeColor: string;
                    if (networkVisualizationMode === 'weights') {
                      // Color-code by weight
                      strokeColor = getWeightColor(edge.weight);
                    } else {
                      // Navigation mode - use path/visited colors
                      strokeColor = isInPath ? "#eab308" : isVisited ? "#93c5fd" : "#4b5563";
                    }

                    return (
                      <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke={strokeColor}
                          strokeWidth={isInPath ? 6 : isVisited ? 4 : 3}
                          opacity={networkVisualizationMode === 'weights' ? 0.8 : (isInPath ? 1 : isVisited ? 0.7 : 0.5)}
                          strokeLinecap="round"
                        />
                        {/* Weight label - show in weight mode or for path edges */}
                        {(networkVisualizationMode === 'weights' || isInPath) && (
                          <circle
                            cx={midX + offsetX}
                            cy={midY + offsetY}
                            r="8"
                            fill="white"
                            stroke={strokeColor}
                            strokeWidth="1.5"
                          />
                        )}
                        {(networkVisualizationMode === 'weights' || isInPath) && (
                          <text
                            x={midX + offsetX}
                            y={midY + offsetY + 3}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="600"
                            fill={networkVisualizationMode === 'weights' ? "#374151" : "#eab308"}
                          >
                            {edge.weight.toFixed(1)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Nodes - rendered on top of edges */}
                  {networkNodes.map((node) => {
                    const isStart = node.id === networkStartNode;
                    const isEnd = node.id === networkEndNode;
                    const isVisited = networkVisitedNodes.has(node.id);
                    const isInPath = networkPath.includes(node.id);

                    let fillColor = '#6b7280';
                    let strokeColor = '#4b5563';
                    let nodeRadius = 3;
                    if (isStart) {
                      fillColor = '#10b981';
                      strokeColor = '#059669';
                      nodeRadius = 5;
                    } else if (isEnd) {
                      fillColor = '#ef4444';
                      strokeColor = '#dc2626';
                      nodeRadius = 5;
                    } else if (isInPath) {
                      fillColor = '#eab308';
                      strokeColor = '#ca8a04';
                      nodeRadius = 4;
                    } else if (isVisited) {
                      fillColor = '#93c5fd';
                      strokeColor = '#60a5fa';
                      nodeRadius = 3.5;
                    }

                    return (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={nodeRadius}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={nodeRadius * 0.8}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleNetworkNodeClick(node.id)}
                        />
                        {/* Only show label for start/end nodes */}
                        {(isStart || isEnd) && (
                          <text
                            x={node.x}
                            y={node.y + nodeRadius + 10}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill={fillColor}
                            className="pointer-events-none"
                          >
                            {node.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p><strong>Instructions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click "Set Start" or "Set End" button, then click a node to set it</li>
                  <li>Click "Run" to find the optimal path using the selected algorithm</li>
                  <li>Click "Show Weights" to visualize impedance values by color (green = low, red = high)</li>
                  <li>Click "Randomize Weights" to generate new random impedance values</li>
                  <li>When running an algorithm, the visualization automatically switches back to navigation mode</li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-gray-700">
                    <strong>Note:</strong> Some roads in this network are one-way. If no path is found between your selected start and end nodes, 
                    try reversing the direction (set the current end as the start, and the current start as the end).
                  </p>
                </div>
                {networkVisualizationMode === 'weights' && (
                  <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">Weight Color Scale:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-4 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded"></div>
                      <span className="text-xs text-gray-600">Low</span>
                      <span className="text-xs text-gray-600">High</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Edges are colored by their impedance weight (1-20)</p>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-700">
              This representation allows routing algorithms to efficiently navigate the network by treating it as a graph, 
              where nodes are vertices and links are edges with weights. The node-link model is fundamental to 
              transportation network analysis, enabling pathfinding, accessibility analysis, and network optimization.
            </p>
          </div>

          <div className="bg-primary-50 p-4 rounded border border-primary-200">
            <p className="text-sm text-gray-700">
              <strong>Why Dijkstra for Small Networks:</strong> For small to medium-sized networks (hundreds to thousands 
              of nodes), Dijkstra's algorithm provides an excellent balance between simplicity and optimality. While A* 
              would be more efficient for very large networks, the uniform exploration of Dijkstra ensures we don't miss 
              potentially safer alternative routes that might not be immediately obvious from a heuristic perspective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

