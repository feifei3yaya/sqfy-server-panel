import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rconService from '../services/rconService';

const prisma = new PrismaClient();

export const getServers = async (req: Request, res: Response) => {
  try {
    const servers = await prisma.server.findMany();
    const serversWithStatus = servers.map(server => ({
      ...server,
      rconStatus: rconService.getConnectionStatus(server.id)
    }));
    res.json(serversWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching servers', error });
  }
};

export const addServer = async (req: Request, res: Response) => {
  const { 
    name, 
    host, 
    rconPort, 
    rconPassword, 
    queryPort,
    fileProtocol,
    fileHost,
    filePort,
    fileUser,
    filePassword,
    filePath
  } = req.body;

  try {
    const server = await prisma.server.create({
      data: {
        name,
        host,
        rconPort: parseInt(rconPort),
        rconPassword,
        queryPort: queryPort ? parseInt(queryPort) : null,
        fileProtocol,
        fileHost,
        filePort: filePort ? parseInt(filePort) : null,
        fileUser,
        filePassword,
        filePath
      }
    });

    // Try to connect RCON immediately
    rconService.connect(server.id);

    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ message: 'Error adding server', error });
  }
};

export const updateServer = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { 
    name, 
    host, 
    rconPort, 
    rconPassword, 
    queryPort,
    fileProtocol,
    fileHost,
    filePort,
    fileUser,
    filePassword,
    filePath
  } = req.body;

  try {
    const server = await prisma.server.update({
      where: { id },
      data: {
        name,
        host,
        rconPort: parseInt(rconPort),
        rconPassword,
        queryPort: queryPort ? parseInt(queryPort) : null,
        fileProtocol,
        fileHost,
        filePort: filePort ? parseInt(filePort) : null,
        fileUser,
        filePassword,
        filePath
      }
    });
    
    // Reconnect RCON
    await rconService.disconnect(id);
    rconService.connect(id);

    res.json(server);
  } catch (error) {
    res.status(500).json({ message: 'Error updating server', error });
  }
};

export const deleteServer = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await rconService.disconnect(id as string);
    await prisma.server.delete({ where: { id: id as string } });
    res.json({ message: 'Server deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting server', error });
  }
};

export const executeRconCommand = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { command } = req.body;

  try {
    const response = await rconService.execute(id as string, command);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ message: 'RCON Error', error: error.message });
  }
};

export const disbandSquad = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { teamId, squadIndex } = req.body;

  if (!teamId || !squadIndex) {
    return res.status(400).json({ message: 'Missing teamId or squadIndex' });
  }

  try {
    // Command: AdminDisbandSquad <TeamNumber> <SquadIndex>
    const command = `AdminDisbandSquad ${teamId} ${squadIndex}`;
    const response = await rconService.execute(id as string, command);
    res.json({ message: `Squad ${squadIndex} on Team ${teamId} disbanded`, response });
  } catch (error: any) {
    res.status(500).json({ message: 'Error disbanding squad', error: error.message });
  }
};

export const getServerMetrics = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { range } = req.query; // e.g. '24h', '7d'

  let fromDate = new Date();
  if (range === '7d') {
    fromDate.setDate(fromDate.getDate() - 7);
  } else {
    // Default 24h
    fromDate.setHours(fromDate.getHours() - 24);
  }

  try {
    const metrics = await prisma.serverMetric.findMany({
      where: {
        serverId: id,
        timestamp: {
          gte: fromDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      select: {
        timestamp: true,
        playerCount: true,
        maxPlayers: true,
        tps: true
      }
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics', error });
  }
};
