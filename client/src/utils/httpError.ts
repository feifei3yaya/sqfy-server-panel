import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as { message?: string; error?: string } | undefined)?.message
      || (error.response?.data as { message?: string; error?: string } | undefined)?.error;
    if (responseMessage) {
      return responseMessage;
    }
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请稍后重试';
    }
    if (!error.response) {
      return '网络连接异常，请检查网络后重试';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};
