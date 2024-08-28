import Fastify from "fastify";

const fastify = Fastify({ logger: true });

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
