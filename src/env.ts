import dotenv from 'dotenv';
import 'source-map-support/register';
import 'reflect-metadata';

dotenv.config();

export class ErrMissingConfiguration extends Error {
  constructor(key: string) {
    super(`Configuration error, missing '${key}'`);
  }
}

const get = (key: string, defaultValue?: string) => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    else {
      throw new ErrMissingConfiguration(key);
    }
  }

  return value;
}

const tryGet = (key: string): string | undefined => {
  return process.env[key] || undefined;
}

export default {
  get,
  tryGet,
}