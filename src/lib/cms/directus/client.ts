import { createDirectus, rest } from '@directus/sdk';

import { getRuntimeEnv } from '../../runtime/env';
import { CmsUnavailableError } from './errors';
import {
  createCmsRepository,
  type CmsRepository,
  type CmsRequest,
} from './repository';
import type { DirectusSchema } from './schema';

export interface ProductionCmsConnection {
  directusUrl: string;
  repository: CmsRepository;
}

export const createDirectusCmsClient = (directusUrl: string) =>
  createDirectus<DirectusSchema>(directusUrl).with(rest());

let connectionPromise: Promise<ProductionCmsConnection> | undefined;

export const getProductionCmsConnection = (): Promise<ProductionCmsConnection> => {
  connectionPromise ??= getRuntimeEnv()
    .then(({ DIRECTUS_URL }) => {
      const client = createDirectusCmsClient(DIRECTUS_URL);
      const request: CmsRequest = (command) => client.request(command);
      return {
        directusUrl: DIRECTUS_URL,
        repository: createCmsRepository(request),
      };
    })
    .catch((cause) => {
      if (cause instanceof CmsUnavailableError) throw cause;
      throw new CmsUnavailableError({ cause });
    });
  return connectionPromise;
};
