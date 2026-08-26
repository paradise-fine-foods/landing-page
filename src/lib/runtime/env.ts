export interface RuntimeEnv {
  readonly DIRECTUS_URL: string;
  readonly CMS_REVALIDATE_SECRET: string;
  readonly CLOUDFLARE_ZONE_ID: string;
  readonly CLOUDFLARE_PURGE_TOKEN: string;
  readonly FORM_SUBMISSION_SECRET: string;
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly GOOGLE_SHEET_ID: string;
}

export async function getRuntimeEnv(): Promise<RuntimeEnv> {
  const { env } = await import('cloudflare:workers');
  return env;
}
