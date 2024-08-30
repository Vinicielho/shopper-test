import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { v4 as uuidv4 } from "uuid";
import { Bill, UploadRequest } from "./models";
import * as db from "./db";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const fileManager = new GoogleAIFileManager(process.env.API_KEY!);

// TODO: PAY ATTENTION TO THE ERROR THROWING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11

export async function askGemini(
  request: FastifyRequest<{ Body: UploadRequest }>,
  reply: FastifyReply
) {
  try {
    const { image, customer_code, measure_datetime, measure_type } =
      request.body;

    // const mimeSignatures: { [key: string]: string } = {
    //   iVBORw0KGgo: "image/png",
    //   "/9j/": "image/jpeg",
    //   UklGR: "image/webp",
    //   AAAAIGZ0eXB: "image/heic",
    // };
    // const imageSignature = image.split(",")[1].substring(0, 15);
    // const imageMimeType = Object.entries(mimeSignatures).find(([signature]) =>
    //   imageSignature.startsWith(signature)
    // )?.[1];

    // if (!imageMimeType) {
    //   return reply.status(400).send({
    //     error_code: "INVALID_DATA",
    //     error_description:
    //       "Image must be a Base64-encoded PNG, JPEG, WEBP, or HEIC/HEIF!",
    //   });
    // }

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

    // const result = await model.generateContent([
    //   //`What value is being registered for the ${measure_type} meter?`,
    //   "what is this?",
    //   {
    //     inlineData: {
    //       data: image,
    //       mimeType: "image/jpeg", //temporary, it should be the const imageMimeType
    //     },
    //   },
    // ]);

    const result = await model.generateContent([
      `What value is being registered for the ${measure_type} meter? in this image: ${image}`,
      {
        inlineData: {
          data: image,
          mimeType: "image/jpeg", // Replace with actual mimeType if using validation
        },
      },
    ]);
    console.log(result);

    const measureValue = parseFloat(result.response.text().trim());
    const measureUUID = uuidv4();

    const newBill: Bill = {
      id: measureUUID,
      customer_code,
      measure_type,
      measure_value: measureValue,
      measure_datetime,
      image_url: `http://example.com/images/${measureUUID}.png`, // How to deal with this temporary image thing? do we addthe image itself to the db, and make the link itself temporary? or do we cache it for a while in the backend aplication itself and then get rid of it i am for the last option?  And again, it melds into the other question about the image
    };

    await db.insertBill(newBill);

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
