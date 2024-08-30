import Fastify from "fastify";
import * as billController from "./controller";

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

const fastify = Fastify({ logger: true });

fastify.listen({ host, port }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

fastify.get("/", () => {
  return "hi, I'm here!";
});
fastify.post("/upload", billController.askGemini);
// fastify.post("/bills", billController.addBill);
// fastify.get("/bills", billController.getBills);
// fastify.delete("/bills/:id", billController.removeBill);
