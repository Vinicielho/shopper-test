import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client
  .connect()
  .catch((err) => console.error("Database connection error", err.stack));

export async function insertBill(bill: {
  customer_code: string;
  measure_type: string;
  measure_value: number;
  measure_datetime: string;
  confirmed_value?: number;
  confirmed_at?: string;
  image_url?: string;
}) {
  const query = `
    INSERT INTO readings (customer_code, measure_type, measure_value, measure_datetime, confirmed_value, confirmed_at, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [
    bill.customer_code,
    bill.measure_type,
    bill.measure_value,
    bill.measure_datetime,
    bill.confirmed_value,
    bill.confirmed_at,
    bill.image_url,
  ];

  try {
    await client.query(query, values);
  } catch (err) {
    console.error("Database query error", err);
    throw err;
  }
}

export async function getAllBills() {
  try {
    const result = await client.query("SELECT * FROM readings");
    return result.rows;
  } catch (error) {
    console.error("Failed to fetch bills", error);
    throw new Error("Failed to fetch bills");
  }
}