
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { prismaMock } from './singleton';
import { addServer, getServers, deleteServer } from '../src/controllers/serverController';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
  };
});

// Mock dependencies
jest.mock('../src/services/rconService', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  getConnectionStatus: jest.fn(),
}));

const app = express();
app.use(express.json());
app.get('/servers', getServers);
app.post('/servers', addServer);
app.delete('/servers/:id', deleteServer);

describe('Server Creation System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a server successfully', async () => {
    const newServer = {
      name: 'Test Server',
      host: '127.0.0.1',
      rconPort: 21114,
      rconPassword: 'password',
    };

    prismaMock.server.create.mockResolvedValue({ id: 'uuid-1', ...newServer } as any);

    const res = await request(app).post('/servers').send(newServer);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('should return 409 when creating duplicate server (Unique Constraint)', async () => {
    const duplicateServer = {
      name: 'Duplicate Server',
      host: '127.0.0.1',
      rconPort: 21114,
      rconPassword: 'password',
    };

    // Simulate Prisma P2002 error
    const prismaError: any = new Error('Unique constraint failed');
    prismaError.code = 'P2002';
    prismaError.meta = { target: ['host', 'rconPort'] };
    
    prismaMock.server.create.mockRejectedValue(prismaError);

    const res = await request(app).post('/servers').send(duplicateServer);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/);
  });

  test('should filter servers list', async () => {
    const servers = [
      { id: '1', name: 'Server A', host: '1.1.1.1', rconPort: 2000, isPublished: true },
      { id: '2', name: 'Server B', host: '2.2.2.2', rconPort: 3000, isPublished: true }
    ];

    prismaMock.server.findMany.mockResolvedValue(servers as any);
    
    const res = await request(app).get('/servers').query({ host: '1.1.1.1' });

    expect(res.status).toBe(200);
    expect(prismaMock.server.findMany).toHaveBeenCalledWith({
      where: { host: { contains: '1.1.1.1' } }
    });
  });
});
