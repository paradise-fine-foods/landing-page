/// <reference types="astro/client" />

interface NetworkInformation {
  readonly saveData?: boolean;
}

interface Navigator {
  readonly connection?: NetworkInformation;
}
