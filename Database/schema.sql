CREATE TABLE IF NOT EXISTS readings (
    measure_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(255) NOT NULL,
    measure_type VARCHAR(50) CHECK (measure_type IN ('WATER', 'GAS')) NOT NULL,
    measure_value INTEGER NOT NULL,
    measure_datetime TIMESTAMP NOT NULL,
    confirmed_value INTEGER,
    confirmed_at TIMESTAMP,
    image_url TEXT
);