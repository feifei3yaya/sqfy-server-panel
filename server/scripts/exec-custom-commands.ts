import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { Rcon as SquadRcon } from 'squad-rcon';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

const COMMANDS = [
  'AdminNoRespawnTimer 1',
  'AdminForceAllVehicleAvailability 1',
  'AdminForceAllRoleAvailability 1',
  'AdminDisableVehicleKitRequirement 1',
  'AdminDisableVehicleclaiming 1',
  'AdminForceAllDeployableAvailability 1'
];

async function main() {
  console.log('Starting command execution script...');
  
  const servers = await prisma.server.findMany({
    where: { isPublished: true }
  });

  if (servers.length === 0) {
    console.log('No published servers found in database.');
    return;
  }

  console.log(`Found ${servers.length} published servers. Attempting to connect and execute commands...`);

  for (const server of servers) {
    console.log(`\n----------------------------------------`);
    console.log(`Target Server: ${server.name}`);
    console.log(`Address: ${server.host}:${server.rconPort}`);
    console.log(`----------------------------------------`);
    
    // @ts-ignore
    const rcon = new SquadRcon({
      id: 1,
      host: server.host,
      port: server.rconPort,
      password: server.rconPassword
    });

    try {
      console.log('Connecting...');
      // @ts-ignore
      await rcon.init();
      console.log('Connected successfully!');

      for (const cmd of COMMANDS) {
        try {
          console.log(`> Executing: ${cmd}`);
          // Add a small delay between commands
          await new Promise(resolve => setTimeout(resolve, 500));
          // @ts-ignore
          const response = await rcon.execute(cmd);
          console.log(`< Response: ${response}`);
        } catch (err: any) {
          console.error(`! Failed to execute command "${cmd}": ${err.message}`);
        }
      }

      console.log('Disconnecting...');
      // @ts-ignore
      await rcon.close();
      console.log('Disconnected.');
    } catch (error: any) {
      console.error(`! Connection failed: ${error.message}`);
      console.log('! skipping commands for this server.');
    }
  }
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
