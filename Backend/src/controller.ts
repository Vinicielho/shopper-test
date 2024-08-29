import * as db from "./db";
import { FastifyReply, FastifyRequest } from "fastify";
import { Bill } from "./models";

export async function addBill(
  request: FastifyRequest<{ Body: Bill }>,
  reply: FastifyReply
) {
  try {
    const bill = request.body;
    await db.insertBill(bill);
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
}

export async function getBills(request: FastifyRequest, reply: FastifyReply) {
  try {
    const bills = await db.getAllBills();
    reply.send(bills);
  } catch (error) {
    reply.status(500).send({
      error: "Failed to retrieve bills",
      details: (error as Error).message,
    });
  }
}
