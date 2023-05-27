import React, { useMemo, useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";

const Graph = ({ graphData }) => {
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

  const graphRef = useRef();

  useEffect(() => {
    const graph = graphRef.current;

    // Set the distance between nodes
    if (graph) {
      graph.d3Force("link").distance(10000);
    }
  }, []);

  return (
    <ForceGraph3D
      ref={graphRef}
      graphData={data}
      nodeRelSize={10}
      nodeAutoColorBy="group"
      linkWidth={2}
      linkColor={(link) =>
        link.source.group === link.target.group ? "blue" : "gray"
      }
      backgroundColor="#f2f2f2"
    />
  );
};

export default Graph;
