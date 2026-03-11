
import rconService from '../rconService';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mPrisma = {
    server: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('squad-rcon', () => {
  return {
    Rcon: jest.fn().mockImplementation(() => ({
      init: jest.fn(),
      close: jest.fn(),
      execute: jest.fn(),
      on: jest.fn(),
    }))
  };
});

// @ts-ignore
import { Rcon as SquadRcon } from 'squad-rcon';

describe('RconService', () => {
  let prisma: any;
  let mockInit: any;
  let mockClose: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    mockInit = jest.fn();
    mockClose = jest.fn();
    (SquadRcon as unknown as jest.Mock).mockImplementation(() => ({
      init: mockInit,
      close: mockClose,
      execute: jest.fn(),
      on: jest.fn(),
    }));
  });

  describe('connect', () => {
    it('should connect to a published server', async () => {
      const server = {
        id: 'server-1',
        name: 'Test Server',
        host: '127.0.0.1',
        rconPort: 21114,
        rconPassword: 'password',
        isPublished: true,
      };

      prisma.server.findUnique.mockResolvedValue(server);

      await rconService.connect(server.id);

      expect(prisma.server.findUnique).toHaveBeenCalledWith({ where: { id: server.id } });
      expect(SquadRcon).toHaveBeenCalledWith({
        id: 1,
        host: server.host,
        port: server.rconPort,
        password: server.rconPassword,
        autoReconnect: false,
      });
      
      expect(mockInit).toHaveBeenCalled();
      expect(rconService.getConnectionStatus(server.id)).toBe('connected');
    });

    it('should skip connection for unpublished server', async () => {
      const server = {
        id: 'server-2',
        name: 'Unpublished Server',
        host: '127.0.0.1',
        rconPort: 21114,
        rconPassword: 'password',
        isPublished: false,
      };

      prisma.server.findUnique.mockResolvedValue(server);

      await rconService.connect(server.id);

      expect(prisma.server.findUnique).toHaveBeenCalledWith({ where: { id: server.id } });
      expect(SquadRcon).not.toHaveBeenCalled(); // Should not instantiate RCON
      expect(rconService.getConnectionStatus(server.id)).toBe('disconnected');
    });

    it('should disconnect if server becomes unpublished', async () => {
        const server = {
          id: 'server-3',
          name: 'Test Server',
          host: '127.0.0.1',
          rconPort: 21114,
          rconPassword: 'password',
          isPublished: true,
        };
  
        // First connect
        prisma.server.findUnique.mockResolvedValue(server);
        await rconService.connect(server.id);
        
        expect(rconService.getConnectionStatus(server.id)).toBe('connected');

        // Now simulate update to unpublished
        const unpublishedServer = { ...server, isPublished: false };
        prisma.server.findUnique.mockResolvedValue(unpublishedServer);
        
        await rconService.connect(server.id);
        
        expect(mockClose).toHaveBeenCalled();
        expect(rconService.getConnectionStatus(server.id)).toBe('disconnected');
      });
  });
});
