import { PrismaClient } from '@prisma/client';
import SquadRcon from 'squad-rcon';
import rconService from '../services/rconService';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    server: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Mock logService and pluginService
jest.mock('../services/logService', () => ({
  processLog: jest.fn(),
}));
jest.mock('../services/pluginService', () => ({
  emit: jest.fn(),
}));

// Mock SquadRcon
jest.mock('squad-rcon', () => {
  return jest.fn().mockImplementation(() => {
    return {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      execute: jest.fn().mockResolvedValue('OK'),
      on: jest.fn(),
    };
  });
});

describe('RconService', () => {
  let prisma: any;
  let rconInstance: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
    
    // Reset internal state if possible, or just rely on connect calls
    // Since it's a singleton, state persists. 
    // We might need to manually clear the map if we could access it, 
    // but it's private.
    // However, we can mock prisma responses to control behavior.
  });

  describe('connect', () => {
    it('should connect to a server successfully', async () => {
      const mockServer = {
        id: 'server1',
        name: 'Test Server',
        host: '127.0.0.1',
        rconPort: 21114,
        rconPassword: 'password',
      };

      (prisma.server.findUnique as jest.Mock).mockResolvedValue(mockServer);

      await rconService.connect('server1');

      expect(prisma.server.findUnique).toHaveBeenCalledWith({ where: { id: 'server1' } });
      expect(SquadRcon).toHaveBeenCalledWith({
        host: mockServer.host,
        port: mockServer.rconPort,
        password: mockServer.rconPassword,
      });
      
      const status = rconService.getConnectionStatus('server1');
      expect(status).toBe('connected');
    });

    it('should handle connection failure', async () => {
      const mockServer = {
        id: 'server2',
        name: 'Fail Server',
        host: '127.0.0.1',
        rconPort: 21114,
        rconPassword: 'password',
      };

      (prisma.server.findUnique as jest.Mock).mockResolvedValue(mockServer);
      
      // Mock SquadRcon to fail
      (SquadRcon as unknown as jest.Mock).mockImplementationOnce(() => ({
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
        on: jest.fn(),
      }));

      await rconService.connect('server2');

      const status = rconService.getConnectionStatus('server2');
      expect(status).toBe('disconnected');
    });
  });

  describe('execute', () => {
    it('should execute command if connected', async () => {
      // Ensure connected first
      const mockServer = {
        id: 'server1',
        name: 'Test Server',
        host: '127.0.0.1',
        rconPort: 21114,
        rconPassword: 'password',
      };
      (prisma.server.findUnique as jest.Mock).mockResolvedValue(mockServer);
      
      // Mock successful connection and execution
      const mockExecute = jest.fn().mockResolvedValue('Command Result');
      (SquadRcon as unknown as jest.Mock).mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        execute: mockExecute,
        on: jest.fn(),
      }));

      // Force reconnect to ensure we get the new mock
      await rconService.disconnect('server1'); 
      await rconService.connect('server1');

      const result = await rconService.execute('server1', 'ShowServerInfo');
      expect(result).toBe('Command Result');
      expect(mockExecute).toHaveBeenCalledWith('ShowServerInfo');
    });
  });
});
