CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(255) NOT NULL,
    measure_type VARCHAR(50) CHECK (measure_type IN ('WATER', 'GAS')) NOT NULL,
    measure_value NUMERIC NOT NULL,
    measure_datetime TIMESTAMP NOT NULL,
    image_url TEXT,
    confirmed_value NUMERIC,
    confirmed_at TIMESTAMP
);