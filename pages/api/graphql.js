import { gql, ApolloServer } from "apollo-server-micro";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";

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
    mentioned_in: [Post]
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
    applies_to: [Post] @relationship(type: "APPLIES_TO", direction: OUT)
  }

  interface MentionedIn @relationshipProperties {
    tagRelevance: Int
  }
`;

const driver = neo4j.driver(
  "neo4j+s://bd777313.databases.neo4j.io",
  neo4j.auth.basic("neo4j", "KJ9SMZbeOY1vr3Rmth_TbJc3KpSGgEgrQUVLarlP0dE")
);

const sessionFactory = () =>
  driver.session({ defaultAccessMode: neo4j.session.READ });

// We create a async function here until "top level await" has landed
// so we can use async/await
async function main() {
  const readonly = true; // We don't want to expose mutations in this case
  const typeDefs = await toGraphQLTypeDefs(sessionFactory, readonly);

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

  const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
    context: ({ req }) => ({ req }),
  });
}

main();
