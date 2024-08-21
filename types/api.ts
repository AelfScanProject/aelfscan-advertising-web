export interface Result<T = any> {
  access_token?: string;
  status: number;
  message: string;
  code: string;
  data?: T;
}
