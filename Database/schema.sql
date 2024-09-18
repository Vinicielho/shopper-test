CREATE TABLE readings (
  measure_uuid UUID PRIMARY KEY,
  customer_code TEXT NOT NULL,
  measure_type TEXT NOT NULL,
  measure_value NUMERIC,
  measure_datetime TIMESTAMP,
  confirmed_value NUMERIC,
  confirmed_at TIMESTAMP,
  image_url TEXT
);
