import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      serverPermission: {
        permissionsList: {
          needs: { permissions: true },
          compute(data) {
            try {
              return data.permissions ? JSON.parse(data.permissions) : [];
            } catch {
              return [];
            }
          },
        },
      },
      player: {
        nameHistoryList: {
          needs: { nameHistory: true },
          compute(data) {
            try {
              return data.nameHistory ? JSON.parse(data.nameHistory) : [];
            } catch {
              return [];
            }
          },
        },
      },
      notificationRule: {
        conditionObj: {
          needs: { condition: true },
          compute(data) {
            try {
              return data.condition ? JSON.parse(data.condition) : {};
            } catch {
              return {};
            }
          },
        },
        channelsList: {
          needs: { channels: true },
          compute(data) {
            try {
              return data.channels ? JSON.parse(data.channels) : [];
            } catch {
              return [];
            }
          },
        },
        targetsList: {
          needs: { targets: true },
          compute(data) {
            try {
              return data.targets ? JSON.parse(data.targets) : [];
            } catch {
              return [];
            }
          },
        },
      },
      systemLog: {
        metadataObj: {
          needs: { metadata: true },
          compute(data) {
            try {
              return data.metadata ? JSON.parse(data.metadata) : null;
            } catch {
              return null;
            }
          },
        },
      },
      gameEvent: {
        dataObj: {
          needs: { data: true },
          compute(data) {
            try {
              return data.data ? JSON.parse(data.data) : null;
            } catch {
              return null;
            }
          },
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Helper to safely parse JSON string from DB
 */
export const safeParse = <T>(data: string | null | undefined, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

/**
 * Helper to stringify object for DB storage
 */
export const toJson = (data: any): string => {
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
};
