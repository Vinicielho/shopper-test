import { Pool } from "pg";
import { Bill } from "./models";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function insertBill(bill: Bill) {
  const {
    id,
    customer_code,
    measure_type,
    measure_value,
    measure_datetime,
    image_url,
  } = bill;

  const query = `
      INSERT INTO readings (id, customer_code, measure_type, measure_value, measure_datetime, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

  const values = [
    id,
    customer_code,
    measure_type,
    measure_value,
    measure_datetime,
    image_url,
  ];

  try {
    await pool.query(query, values);
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
    const result = await pool.query(query, [
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

export async function getBillById(measure_uuid: string): Promise<Bill | null> {
  const result = await pool.query(
    "SELECT * FROM readings WHERE measure_uuid = $1",
    [measure_uuid]
  );
  return result.rows.length ? (result.rows[0] as Bill) : null;
}

export async function updateBillConfirmation(
  measure_uuid: string,
  confirmed_value: number
): Promise<void> {
  await pool.query(
    "UPDATE readings SET confirmed_value = $1, confirmed_at = NOW() WHERE id = $2",
    [confirmed_value, measure_uuid]
  );
}

export async function getBillsByCustomer(
  customer_code: string,
  measure_type?: "WATER" | "GAS"
): Promise<
  Array<{
    id: string;
    customer_code: string;
    measure_type: string;
    measure_value: number;
    measure_datetime: string;
    image_url: string;
  }>
> {
  try {
    let query = `SELECT id, customer_code, measure_type, measure_value, measure_datetime, image_url FROM readings WHERE customer_code = $1`;
    const values = [customer_code];

    if (measure_type) {
      query += " AND measure_type = $2";
      values.push(measure_type);
    }

    const result = await pool.query(query, values);

    return result.rows;
  } catch (error) {
    console.error("Error querying bills by customer:", error);
    throw error;
  }
}


//Test methods:
// export async function deleteBill(billId: string): Promise<void> {
//   const query = "DELETE FROM readings WHERE id = $1";
//   try {
//     const result = await client.query(query, [billId]);
//     if (result.rowCount === 0) {
//       throw new Error("No bill found with the provided ID");
//     }
//   } catch (err) {
//     console.error("Database query error", err);
//     throw err;
//   }
// }

// export async function getAllBills(): Promise<Bill[]> {
//   const query = "SELECT * FROM readings";
//   try {
//     const result = await client.query(query);
//     return result.rows as Bill[];
//   } catch (err) {
//     console.error("Database query error", err);
//     throw err;
//   }
// }
