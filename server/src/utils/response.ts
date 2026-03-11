export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  error?: string;
}

export const success = <T>(data: T, message = 'success'): ApiResponse<T> => ({
  code: 0,
  message,
  data,
});

export const pageSuccess = <T>(
  items: T[], 
  total: number, 
  page: number, 
  pageSize: number
): ApiResponse<{ items: T[]; total: number; page: number; pageSize: number }> => ({
  code: 0,
  message: 'success',
  data: {
    items,
    total,
    page,
    pageSize,
  },
});

export const fail = (message: string, code = 4000, error?: any): ApiResponse => ({
  code,
  message,
  error: error instanceof Error ? error.message : error,
});
