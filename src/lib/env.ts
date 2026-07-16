const DEFAULT_EXECUTION_SERVICE_URL = "http://127.0.0.1:8787";
const DEFAULT_EXECUTION_HOST = "127.0.0.1";
const DEFAULT_EXECUTION_PORT = 8787;
const DEFAULT_SITE_URL = "http://localhost:3000";

export const env = {
  executionServiceUrl: process.env.EXECUTION_SERVICE_URL ?? DEFAULT_EXECUTION_SERVICE_URL,
  executionHost: process.env.EXECUTION_HOST ?? DEFAULT_EXECUTION_HOST,
  executionPort: Number(process.env.EXECUTION_PORT ?? DEFAULT_EXECUTION_PORT),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
} as const;
