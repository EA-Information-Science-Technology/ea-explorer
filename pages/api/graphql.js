import { gql, ApolloServer } from "apollo-server-micro";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";

const typeDefs = gql`
  type Post @exclude(operations: [CREATE, UPDATE, DELETE]) {
    _id: ID
    postedAt: DateTime
    htmlBody: String
    shortform: Boolean
    question: Boolean
    meta: Boolean
    pageUrl: String
    modifiedAt: DateTime
    title: String
    lastCommentedAt: DateTime
    voteCount: Int
    baseScore: Int
    extendedScore: Int
    score: Float
    mentioned_in: [Post!]!
      @relationship(
        type: "MENTIONED_IN"
        properties: "MentionedIn"
        direction: OUT
      )
  }

  type Tag @exclude(operations: [CREATE, UPDATE, DELETE]) {
    _id: ID
    createdAt: DateTime
    descriptionHtmlWithToc: String
    slug: String
    name: String
    postCount: Int
    lastVisitedAt: DateTime
    applies_to: [Post!]! @relationship(type: "APPLIES_TO", direction: OUT)
  }

  interface MentionedIn @relationshipProperties {
    tagRelevance: Int
  }
`;

const driver = neo4j.driver(
  "neo4j+s://bd777313.databases.neo4j.io",
  neo4j.auth.basic("neo4j", "KJ9SMZbeOY1vr3Rmth_TbJc3KpSGgEgrQUVLarlP0dE")
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  const apolloServer = new ApolloServer({
    schema: await neoSchema.getSchema(),
  });
  await apolloServer.start();
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
