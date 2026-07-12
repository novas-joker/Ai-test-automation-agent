// utils/envValidator.ts
import { z } from 'zod';

const envSchema = z.object({
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_REDIRECT_URI: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  // add other required env vars here
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
}
