import { Request, Response } from 'express';
let mockPrisma: any;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => {
    mockPrisma = {
      server: {
        findMany: jest.fn(),
      },
      serverPermission: {
        findMany: jest.fn(),
      },
    };
    return mockPrisma;
  }),
}));

jest.mock('../services/rconService', () => ({
  __esModule: true,
  default: {
    getConnectionStatus: jest.fn(() => 'connected'),
  },
}));

const { getServers } = require('../controllers/serverController');

describe('serverController.getServers', () => {
  const response = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('superadmin can query all servers without permission filtering', async () => {
    const req = {
      query: {},
      user: { id: 'u1', role: 'superadmin' },
    } as unknown as Request;

    mockPrisma.server.findMany.mockResolvedValue([
      { id: 's1', isPublished: true, name: 'S1' },
    ]);

    await getServers(req, response);

    expect(mockPrisma.serverPermission.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.server.findMany).toHaveBeenCalledWith({
      where: {},
    });
    expect((response.json as jest.Mock).mock.calls[0][0]).toHaveLength(1);
  });

  it('non-superadmin only receives authorized servers', async () => {
    const req = {
      query: {},
      user: { id: 'u2', role: 'observer' },
    } as unknown as Request;

    mockPrisma.serverPermission.findMany.mockResolvedValue([
      { serverId: 's2' },
      { serverId: 's3' },
    ]);
    mockPrisma.server.findMany.mockResolvedValue([
      { id: 's2', isPublished: true, name: 'S2' },
      { id: 's3', isPublished: false, name: 'S3' },
    ]);

    await getServers(req, response);

    expect(mockPrisma.serverPermission.findMany).toHaveBeenCalledWith({
      where: { userId: 'u2' },
      select: { serverId: true },
    });
    expect(mockPrisma.server.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['s2', 's3'] } },
    });
    expect((response.json as jest.Mock).mock.calls[0][0]).toHaveLength(2);
  });
});
