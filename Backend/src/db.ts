import { Client } from "pg";

// TODO: consolidate the client declaration and connection?
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
// TODO: log when db connects or if thers an error!
client
  .connect()
  .catch((err) => console.error("Database connection error", err.stack));
