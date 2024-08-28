import Fastify from "fastify";
import { Client } from "pg";

const fastify = Fastify({ logger: true });
const client = new Client({ connectionString: process.env.DATABASE_URL });

const host =
  process.env.BACKEND_HOST ||
  (() => {
    throw new Error("Environment variable BACKEND_HOST is not defined");
  })();

const port = parseInt(
  process.env.BACKEND_PORT ||
    (() => {
      throw new Error("Environment variable BACKEND_PORT is not defined");
    })(),
  10
);

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});

fastify.get("/", async (request, reply) => {
  return "hi, i'm here!";
});