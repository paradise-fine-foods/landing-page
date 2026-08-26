/// <reference types="astro/client" />

interface CloudflareRuntimeEnv {
  readonly DIRECTUS_URL: string;
  readonly CMS_REVALIDATE_SECRET: string;
  readonly CLOUDFLARE_ZONE_ID: string;
  readonly CLOUDFLARE_PURGE_TOKEN: string;
  readonly FORM_SUBMISSION_SECRET: string;
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly GOOGLE_SHEET_ID: string;
}

declare module 'cloudflare:workers' {
  const env: CloudflareRuntimeEnv;
  export { env };
}

interface NetworkInformation {
  readonly saveData?: boolean;
}

interface Navigator {
  readonly connection?: NetworkInformation;
}
