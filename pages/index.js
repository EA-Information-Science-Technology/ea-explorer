import dynamic from "next/dynamic";
import { useQuery, gql } from "@apollo/client";
import { useState, useMemo, useCallback } from "react";

const Graph = dynamic(() => import("../components/ForceGraphTest"), {
  ssr: false,
});

const mostRecentQuery = gql`
  query {
    posts(options: { limit: 10000, sort: { postedAt: ASC } }) {
      __typename
      _id
      pageUrl
      title
      postedAt
      mentioned_in {
        _id
        __typename
      }
    }
    tags(options: { limit: 1000, sort: { _id: ASC } }) {
      __typename
      _id
      name
      applies_to {
        _id
        __typename
      }
    }
  }
`;

const _ = require("lodash");

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
      url: p.pageUrl,
      __typename: p.__typename,
    });

    p.mentioned_in.forEach((pb) => {
      nodes.push({
        id: pb._id,
        title: pb.title,
        __typename: pb.__typename,
      });

      if (nodes.some((post) => post.id === p._id)) {
        links.push({
          source: p._id,
          target: pb._id,
        });
      }
    });
  });

  data.tags.forEach((t) => {
    nodes.push({
      id: t._id,
      name: t.name,
      __typename: t.__typename,
    });

    t.applies_to.forEach((p) => {
      if (nodes.some((post) => post.id === p._id)) {
        links.push({
          source: t._id,
          target: p._id,
        });
      }
    });
  });

  nodes.forEach((node) => {
    node.numLinks = links.filter((link) => node.id === link.source).length;
  });

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

  return <Graph graphData={graphData} />;
}
