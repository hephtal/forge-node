import { Graph } from './graph';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import * as React from 'react';

interface NodePos {
  id: string;
  x: number;
  y: number;
}

interface GraphConnectorProps {
  graph: Graph;
  setGraph: (graph: Graph) => void;
  height: number;
}

export default function GraphConnector({
  graph,
  setGraph,
  height,
}: GraphConnectorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const selectedNodes = useRef<string[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;
    // Get parent's dimensions
    const parent = svgRef.current.parentElement;
    const width = parent ? parent.clientWidth : 0;
    const nodeDiameter = 35;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Use safeEdges to ensure edges is always an array
    const safeEdges = Array.isArray(graph.edges) ? graph.edges : [];

    // Calculate circular layout positions
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(Math.min(width, height) * 0.3);
    const angleStep = (2 * Math.PI) / graph.nodes.length;
    const nodePositions = graph.nodes.map((node, i) => {
      return {
        id: node.id,
        x: centerX + radius * Math.cos(i * angleStep),
        y: centerY + radius * Math.sin(i * angleStep),
      } as NodePos;
    });

    // Draw links
    const linkGroup = svg.append('g').attr('class', 'links');
    const links = linkGroup
      .selectAll('line')
      .data(safeEdges)
      .join('line')
      // Use Tailwind classes for stroke color and stroke width
      .attr('class', 'stroke-gray-500 stroke-[4px]');

    links.each(function (d) {
      const sourceNode = nodePositions.find((n) => n.id === d.source);
      const targetNode = nodePositions.find((n) => n.id === d.target);
      if (sourceNode && targetNode) {
        d3.select(this)
          .attr('x1', sourceNode.x)
          .attr('y1', sourceNode.y)
          .attr('x2', targetNode.x)
          .attr('y2', targetNode.y);
      }
    });

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const nodes = nodeGroup
      .selectAll('g')
      .data(nodePositions)
      .join('g')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .on('click', (event, d) => handleNodeClick(d.id));

    // Circle for each node
    nodes
      .append('circle')
      .attr('r', nodeDiameter)
      .attr('class', (d) =>
        selectedNodes.current.includes(d.id)
          ? 'fill-[hsl(var(--primary))]'
          : 'fill-[hsl(var(--chart-2))]',
      );

    // Labels
    nodes
      .append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      // Use Tailwind classes for text color and size
      .attr('class', 'fill-white text-[12px]')
      .text((d) => {
        const nodeDef = graph.nodes.find((n) => n.id === d.id);
        return nodeDef ? nodeDef.label : '';
      });

    function handleNodeClick(nodeId: string) {
      if (selectedNodes.current.length < 2) {
        // Add to selected nodes if not already selected
        if (!selectedNodes.current.includes(nodeId)) {
          selectedNodes.current.push(nodeId);
          // Update node color to indicate selection
          nodes
            .selectAll('circle')
            .attr('class', (d) =>
              selectedNodes.current.includes((d as NodePos).id)
                ? 'fill-[hsl(var(--primary))]'
                : 'fill-[hsl(var(--chart-2))]',
            );
        }
        // If we have 2 nodes selected, create or remove relationship
        if (selectedNodes.current.length === 2) {
          const [node1, node2] = selectedNodes.current;
          handleNodePair(node1, node2);
          // Reset selection
          selectedNodes.current = [];
          nodes.selectAll('circle').attr('class', 'fill-blue-500');
        }
      }
    }

    function handleNodePair(node1: string, node2: string) {
      const existingLinkIndex = safeEdges.findIndex(
        (link) =>
          (link.source === node1 && link.target === node2) ||
          (link.source === node2 && link.target === node1),
      );
      if (existingLinkIndex >= 0) {
        // Remove existing relationship
        const newLinks = [...safeEdges];
        newLinks.splice(existingLinkIndex, 1);
        setGraph({ ...graph, edges: newLinks });
      } else {
        // Add new relationship
        setGraph({
          ...graph,
          edges: [...safeEdges, { source: node1, target: node2 }],
        });
      }
    }
  }, [graph, setGraph, height]);

  return <svg ref={svgRef} style={{ border: '1px solid #ccc' }} />;
};