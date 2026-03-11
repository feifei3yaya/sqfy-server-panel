import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import logWatcherService from '../src/services/logWatcherService';

const prisma = new PrismaClient();
const TEST_LOG_FILE = path.resolve(__dirname, 'test_squad.log');
const SERVER_ID = 'test-server-integrity';

async function setup() {
  // Clean up
  if (fs.existsSync(TEST_LOG_FILE)) fs.unlinkSync(TEST_LOG_FILE);
  await prisma.log.deleteMany({ where: { serverId: SERVER_ID } });
  await prisma.logState.deleteMany({ where: { serverId: SERVER_ID } });
  await prisma.server.deleteMany({ where: { id: SERVER_ID } });

  // Create Server
  await prisma.server.create({
    data: {
      id: SERVER_ID,
      name: 'Integrity Test Server',
      host: '127.0.0.1',
      rconPort: 12345,
      rconPassword: 'test',
      filePath: TEST_LOG_FILE
    }
  });

  // Create empty log file
  fs.writeFileSync(TEST_LOG_FILE, '');
}

async function runTest() {
  console.log('--- Starting Log Integrity Test ---');
  await setup();

  // Start Watcher
  logWatcherService.watch(TEST_LOG_FILE, SERVER_ID);

  const TOTAL_LINES_BATCH_1 = 1000;
  const TOTAL_LINES_BATCH_2 = 1000;

  console.log(`Writing ${TOTAL_LINES_BATCH_1} lines rapidly...`);
  const stream = fs.createWriteStream(TEST_LOG_FILE, { flags: 'a' });
  
  for (let i = 0; i < TOTAL_LINES_BATCH_1; i++) {
    stream.write(`[2023.10.27-12.00.00:000][${i}]LogSquad: Test Log Line ${i}\n`);
  }
  stream.end();

  // Wait for processing
  console.log('Waiting for batch 1 processing...');
  await new Promise(r => setTimeout(r, 5000));

  let count = await prisma.log.count({ where: { serverId: SERVER_ID } });
  console.log(`DB Count after Batch 1: ${count}/${TOTAL_LINES_BATCH_1}`);

  // Simulate Rotation
  console.log('Simulating Log Rotation (Truncate)...');
  fs.writeFileSync(TEST_LOG_FILE, ''); // Truncate
  
  // Write Batch 2
  console.log(`Writing ${TOTAL_LINES_BATCH_2} lines after rotation...`);
  // Re-open stream for new file (fs.createWriteStream overwrites if no flags, but we want to append or write new)
  // Wait a bit to ensure watcher detected rotation
  await new Promise(r => setTimeout(r, 1000));
  
  const stream2 = fs.createWriteStream(TEST_LOG_FILE, { flags: 'w' }); // 'w' for write/truncate
  for (let i = 0; i < TOTAL_LINES_BATCH_2; i++) {
    stream2.write(`[2023.10.27-13.00.00:000][${i}]LogSquad: Post-Rotation Log Line ${i}\n`);
  }
  stream2.end();

  // Wait for processing
  console.log('Waiting for batch 2 processing...');
  // Increase wait time significantly
  await new Promise(r => setTimeout(r, 20000));

  count = await prisma.log.count({ where: { serverId: SERVER_ID } });
  const expected = TOTAL_LINES_BATCH_1 + TOTAL_LINES_BATCH_2;
  console.log(`Final DB Count: ${count}/${expected}`);

  if (count === expected) {
    console.log('✅ TEST PASSED: Zero Data Loss Achieved');
  } else {
    console.error('❌ TEST FAILED: Data Loss Detected');
  }

  // Cleanup
  logWatcherService.stop(SERVER_ID);
  // fs.unlinkSync(TEST_LOG_FILE);
  await prisma.$disconnect();
  
  // Force exit to kill any lingering RCON connection timers
  process.exit(count === expected ? 0 : 1);
}

runTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
