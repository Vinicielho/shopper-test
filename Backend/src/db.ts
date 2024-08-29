import { Client } from "pg";
import { Bill } from "./models";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client
  .connect()
  .catch((err) => console.error("Database connection error", err.stack));

export async function insertBill(bill: Bill) {
  const {
    customer_code,
    measure_type,
    measure_value,
    measure_datetime,
    confirmed_value,
    confirmed_at,
    image_url,
  } = bill;

  const query = `
    INSERT INTO readings (customer_code, measure_type, measure_value, measure_datetime, confirmed_value, confirmed_at, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  const values = [
    customer_code,
    measure_type,
    measure_value,
    measure_datetime,
    confirmed_value,
    confirmed_at,
    image_url,
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
