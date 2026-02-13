import { API_URL, OTP_EXPIRY, MAX_OTP_ATTEMPTS } from '@env';

export const env = {
  API_URL: API_URL || 'https://kilimo-backend-betv.onrender.com/',
  OTP_EXPIRY: parseInt(OTP_EXPIRY || '120', 10),
  MAX_OTP_ATTEMPTS: parseInt(MAX_OTP_ATTEMPTS || '3', 10),
  isDevelopment: __DEV__,
};

export type Env = typeof env;