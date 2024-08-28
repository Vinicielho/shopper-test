import Fastify from "fastify";
import { getAllBills, insertBill } from "./db";

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

fastify.listen({ host, port }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

fastify.get("/", async () => {
  return "hi, I'm here!";
});

fastify.post("/bills", async (request, reply) => {
  try {
    const {
      customer_code,
      measure_type,
      measure_value,
      measure_datetime,
      confirmed_value,
      confirmed_at,
      image_url,
    } = request.body as {
      customer_code: string;
      measure_type: string;
      measure_value: number;
      measure_datetime: string;
      confirmed_value?: number;
      confirmed_at?: string;
      image_url?: string;
    };

    await insertBill({
      customer_code,
      measure_type,
      measure_value,
      measure_datetime,
      confirmed_value,
      confirmed_at,
      image_url,
    });

    reply.status(201).send({ message: "Bill added successfully" });
  } catch (error) {
    if (error instanceof Error) {
      reply
        .status(500)
        .send({ error: "Failed to add bill", details: error.message });
    } else {
      reply.status(500).send({
        error: "Failed to add bill",
        details: "An unknown error occurred",
      });
    }
  }
});

fastify.get("/bills", async (request, reply) => {
  try {
    const bills = await getAllBills();
    reply.send(bills);
  } catch (error) {
    reply.status(500).send({
      error: "Failed to retrieve bills",
      details: (error as Error).message,
    });
  }
});