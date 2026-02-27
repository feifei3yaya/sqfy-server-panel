import { register, login } from '../controllers/authController';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let prisma: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prisma = new PrismaClient(); // This returns the mocked instance
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };

      // Mock prisma calls
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.count as jest.Mock).mockResolvedValue(0); // First user -> superadmin
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        username: 'testuser',
        role: 'superadmin',
      });
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await register(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: 'testuser' }, { email: 'test@example.com' }],
        },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'testuser',
          passwordHash: 'hashedPassword',
          email: 'test@example.com',
          role: 'superadmin',
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mockToken',
        user: { id: '1', username: 'testuser', role: 'superadmin' },
      });
    });

    it('should return 400 if user already exists', async () => {
      mockRequest.body = {
        username: 'existinguser',
        password: 'password123',
        email: 'existing@example.com',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1' });

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Username or email already exists',
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: 'hashedPassword',
        role: 'user',
        twoFASecret: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await login(mockRequest as Request, mockResponse as Response);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mockToken',
        user: { id: '1', username: 'testuser', role: 'user' },
      });
    });

    it('should return 401 with invalid password', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: 'hashedPassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });
  });
});
