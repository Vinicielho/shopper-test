import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { Bill, ConfirmRequest, UploadRequest } from "./models";
import * as db from "./db";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function askGemini(
  request: FastifyRequest<{ Body: UploadRequest }>,
  reply: FastifyReply
) {
  try {
    const { image, customer_code, measure_datetime, measure_type } =
      request.body;

    const mimeSignatures = new Map<string, string>([
      ["iVBORw0KGgo", "image/png"],
      ["/9j/", "image/jpeg"],
      ["UklGR", "image/webp"],
      ["AAAAIGZ0eXB", "image/heic"],
    ]);
    const base64Data = (
      image.startsWith("data:image/") ? image.split(",")[1] : image
    ).trim();
    const imageSignature = base64Data.substring(0, 15);
    const imageMimeType = [...mimeSignatures].find(([signature]) =>
      imageSignature.startsWith(signature)
    )?.[1];

    if (!imageMimeType) {
      return reply.status(400).send({
        error_code: "INVALID_DATA",
        error_description:
          "Image must be a base64-encoded PNG, JPEG, WEBP, or HEIC/HEIF!",
      });
    }

    const existingBill = await db.getBillByCustomerAndMonth(
      customer_code,
      measure_type,
      new Date(measure_datetime).getMonth() + 1
    );
    if (existingBill) {
      return reply.status(409).send({
        error_code: "DOUBLE_REPORT",
        error_description: "Leitura do mês já realizada",
      });
    }

    const geminiResponse = await model.generateContent([
      `tell me the value being registered in the ${measure_type} meter? Numbers only!`,
      {
        inlineData: {
          data: base64Data,
          mimeType: imageMimeType,
        },
      },
    ]);

    const measureValue = parseFloat(geminiResponse.response.text().trim());
    if (isNaN(measureValue)) {
      throw new Error("Failed to parse measure value from Gemini response.");
    }

    const measureUUID = uuidv4();
    const newBill: Bill = {
      measure_uuid: measureUUID,
      customer_code,
      measure_type,
      measure_value: measureValue,
      measure_datetime,
      image_url: `http://example.com/images/${measureUUID}.png`,
    };
    try {
      await db.insertBill(newBill);
    } catch (dbError) {
      console.error("Database insert error", dbError);
      throw new Error("Failed to insert bill into the database");
    }

    reply.send({
      image_url: newBill.image_url,
      measure_value: measureValue,
      measure_uuid: measureUUID,
    });
  } catch (error) {
    reply.status(500).send({
      error: "Failed to process image",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

export async function confirmBill(
  request: FastifyRequest<{ Body: ConfirmRequest }>,
  reply: FastifyReply
) {
  try {
    const { measure_uuid, confirmed_value } = request.body;

    if (
      typeof measure_uuid !== "string" ||
      typeof confirmed_value !== "number"
    ) {
      return reply.status(400).send({
        error_code: "INVALID_DATA",
        error_description: "Invalid measure id or confirmed value",
      });
    }

    const bill = await db.getBillById(measure_uuid);
    if (!bill) {
      return reply.status(404).send({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Reading not found",
      });
    }

    if (bill.confirmed_value !== undefined) {
      return reply.status(409).send({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura do mês já realizada",
      });
    }

    await db.updateBillConfirmation(measure_uuid, confirmed_value);

    reply.send({ success: true });
  } catch (error) {
    reply.status(500).send({
      error: "Failed to confirm reading",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

export async function listMeasures(
  request: FastifyRequest<{
    Params: { customer_code: string };
    Querystring: { measure_type?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { customer_code } = request.params;
    const { measure_type } = request.query;

    if (
      measure_type &&
      !["WATER", "GAS"].includes(measure_type.toUpperCase())
    ) {
      return reply.status(400).send({
        error_code: "INVALID_TYPE",
        error_description: "Tipo de medição não permitida",
      });
    }

    const measures = await db.getBillsByCustomer(
      customer_code,
      measure_type as "WATER" | "GAS"
    );

    if (measures.length === 0) {
      return reply.status(404).send({
        error_code: "MEASURES_NOT_FOUND",
        error_description: "Nenhuma leitura encontrada",
      });
    }

    reply.send({
      customer_code,
      measures,
    });
  } catch (error) {
    reply.status(500).send({
      error: "Failed to list measures",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}

// test methods
// export async function addBill(
//   request: FastifyRequest<{ Body: Bill }>,
//   reply: FastifyReply
// ) {
//   try {
//     const bill: Bill = request.body;
//     await db.insertBill(bill);
//     reply.status(201).send({ message: "Bill added successfully" });
//   } catch (error) {
//     reply.status(500).send({
//       error: "Failed to add bill",
//       details:
//         error instanceof Error ? error.message : "An unknown error occurred",
//     });
//   }
// }

// export async function getBills(request: FastifyRequest, reply: FastifyReply) {
//   try {
//     const bills: Bill[] = await db.getAllBills();
//     reply.send(bills);
//   } catch (error) {
//     reply.status(500).send({
//       error: "Failed to retrieve bills",
//       details:
//         error instanceof Error ? error.message : "An unknown error occurred",
//     });
//   }
// }

// export async function removeBill(
//   request: FastifyRequest<{ Params: { id: string } }>,
//   reply: FastifyReply
// ) {
//   try {
//     const billId = request.params.id;
//     await db.deleteBill(billId);
//     reply.status(204).send();
//   } catch (error) {
//     reply.status(500).send({
//       error: "Failed to remove bill",
//       details:
//         error instanceof Error ? error.message : "An unknown error occurred",
//     });
//   }
// }
