export interface Bill {
  customer_code: string;
  measure_type: string;
  measure_value: number;
  measure_datetime: string;
  confirmed_value?: number;
  confirmed_at?: string;
  image_url?: string;
}
