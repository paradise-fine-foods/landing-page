/// <reference types="astro/client" />

interface CloudflareRuntimeEnv {
  readonly DIRECTUS_URL: string;
  readonly CMS_REVALIDATE_SECRET: string;
  readonly CLOUDFLARE_ZONE_ID: string;
  readonly CLOUDFLARE_PURGE_TOKEN: string;
  readonly FORM_SUBMISSION_SECRET: string;
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
