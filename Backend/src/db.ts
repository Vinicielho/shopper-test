import { Client } from "pg";
import { Bill } from "./models";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client
  .connect()
  .catch((err) => console.error("Database connection error", err.stack));

export async function insertBill(bill: Bill) {
  const { id, customer_code, measure_type, measure_value, measure_datetime } =
    bill;

  const query = `
    INSERT INTO readings (id, customer_code, measure_type, measure_value, measure_datetime, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  const values = [
    id,
    customer_code,
    measure_type,
    measure_value,
    measure_datetime,
  ];

  try {
    await client.query(query, values);
  } catch (err) {
    console.error("Database query error", err);
    throw err;
  }
}

export async function deleteBill(billId: string): Promise<void> {
  const query = "DELETE FROM readings WHERE id = $1";
  try {
    const result = await client.query(query, [billId]);
    if (result.rowCount === 0) {
      throw new Error("No bill found with the provided ID");
    }
  } catch (err) {
    console.error("Database query error", err);
    throw err;
  }
}

export async function getAllBills(): Promise<Bill[]> {
  const query = "SELECT * FROM readings";
  try {
    const result = await client.query(query);
    return result.rows as Bill[];
  } catch (err) {
    console.error("Database query error", err);
    throw err;
  }
}

export async function getBillByCustomerAndMonth(
  customer_code: string,
  measure_type: "WATER" | "GAS",
  month: number
): Promise<Bill | null> {
  const query = `
    SELECT * FROM readings
    WHERE customer_code = $1
      AND measure_type = $2
      AND EXTRACT(MONTH FROM measure_datetime::date) = $3
  `;

  try {
    const result = await client.query(query, [
      customer_code,
      measure_type,
      month,
    ]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("Database query error", err);
    throw err;
  }
}
