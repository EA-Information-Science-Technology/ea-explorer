import dynamic from "next/dynamic";
import { useMemo, useCallback, useState } from "react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const NODE_R = 8;
const HighlightGraph = ({ graphData }) => {
  const crossLinkNodes = () => {
    // cross-link node objects
    graphData.links.forEach((link) => {
      const node_source = graphData.nodes.find((x) => x.id === link.source);
      const node_target = graphData.nodes.find((x) => x.id === link.target);
      !node_source.neighbors && (node_source.neighbors = []);
      !node_target.neighbors && (node_target.neighbors = []);
      node_source.neighbors.push(node_target);
      node_target.neighbors.push(node_source);

      !node_source.links && (node_source.links = []);
      !node_target.links && (node_target.links = []);
      node_source.links.push(link);
      node_target.links.push(link);
    });

    return graphData;
  };
  const data = useMemo(() => crossLinkNodes(graphData), [graphData]);

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = (node) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links.forEach((link) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = (link) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const paintRing = useCallback(
    (node, ctx) => {
      // add ring just for highlighted nodes
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
      ctx.fillStyle = node === hoverNode ? "red" : "orange";
      ctx.fill();
    },
    [hoverNode]
  );

  return (
    <ForceGraph2D
      graphData={data}
      nodeRelSize={NODE_R}
      autoPauseRedraw={false}
      linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={(link) =>
        highlightLinks.has(link) ? 4 : 0
      }
      nodeCanvasObjectMode={(node) =>
        highlightNodes.has(node) ? "before" : undefined
      }
      nodeCanvasObject={paintRing}
      onNodeHover={handleNodeHover}
      onLinkHover={handleLinkHover}
    />
  );
};

export default HighlightGraph;
