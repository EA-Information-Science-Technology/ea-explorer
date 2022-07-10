import dynamic from "next/dynamic";
import { useQuery, gql } from "@apollo/client";
import { useState } from "react";

const NoSSRForceGraph = dynamic(() => import("../lib/NoSSRForceGraph"), {
  ssr: false,
});

const mostRecentQuery = gql`
  query {
    posts(options: { limit: 1000, sort: { postedAt: DESC } }) {
      __typename
      _id
      pageUrl
      title
      postedAt
      mentioned_in {
        _id
        title
        __typename
      }
    }
    tags(options: { limit: 1000, sort: { _id: ASC } }) {
      __typename
      _id
      name
    }
  }
`;

const formatData = (data) => {
  // this could be generalized but let's leave that for another time

  const nodes = [];
  const links = [];

  if (!data.posts) {
    return;
  }

  data.posts.forEach((p) => {
    nodes.push({
      id: p._id,
      title: p.title,
      url: p.url,
      __typename: p.__typename,
    });

    /*p.applies_to.forEach((t) => {
      nodes.push({
        id: t._id,
        name: t.name,
        __typename: t.__typename,
      });
      links.push({
        source: t._id,
        target: p._id,
      });
    });

    p.mentioned_in.forEach((pb) => {
      nodes.push({
        id: t._id,
        __typename: t.__typename,
      });
      links.push({
        source: p._id,
        target: pb._id,
      });
    });
  });*/

  return {
    // nodes may be duplicated so use lodash's uniqBy to filter out duplicates
    nodes: _.uniqBy(nodes, "id"),
    links,
  };
};

export default function Home() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const { data } = useQuery(mostRecentQuery, {
    onCompleted: (data) => setGraphData(formatData(data)),
  });

  return (
    <NoSSRForceGraph
      graphData={graphData}
      nodeLabel={(node) => {
        return node.id;
      }}
      nodeAutoColorBy={"__typename"}
      nodeRelSize={8}
    />
  );
}
