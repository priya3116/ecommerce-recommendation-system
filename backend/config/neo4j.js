const neo4j = require("neo4j-driver");

const configuredUri = process.env.NEO4J_URI || "bolt://127.0.0.1:7687";
const neo4jUri = configuredUri.startsWith("neo4j://127.0.0.1")
    ? configuredUri.replace("neo4j://", "bolt://")
    : configuredUri;

const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(
        process.env.NEO4J_USERNAME,
        process.env.NEO4J_PASSWORD
    )
);

module.exports = driver;