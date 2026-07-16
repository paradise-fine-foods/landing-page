/// <reference types="astro/client" />

interface Navigator {
  readonly connection?: {
    readonly saveData?: boolean;
  };
}
