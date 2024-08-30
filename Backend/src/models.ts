export interface UploadRequest {
  image: string;
  customer_code: string;
  measure_datetime: string;
  measure_type: "WATER" | "GAS";
}

export interface Bill {
  id: string;
  customer_code: string;
  measure_type: "WATER" | "GAS";
  measure_value: number;
  measure_datetime: string;
  image_url: string;
  confirmed_value?: number;
  confirmed_at?: string;
}

export interface ConfirmRequest {
  measure_uuid: string;
  confirmed_value: number;
}
