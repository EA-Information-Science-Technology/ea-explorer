import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";

const NoSSRForceGraph = dynamic(() => import("../lib/NoSSRForceGraph"), {
  ssr: false,
});

const myData = {
  nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
  links: [
    { source: "a", target: "b" },
    { source: "c", target: "a" },
  ],
};

export default function Home() {
  return <NoSSRForceGraph graphData={myData} />;
}
