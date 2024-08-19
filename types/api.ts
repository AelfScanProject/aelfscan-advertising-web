export interface Result<T = any> {
  status: number;
  message: string;
  code: string;
  data?: T;
}
