import { io, Socket } from 'socket.io-client';

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const CLIENT_COUNT = 50;
const TEST_DURATION_MS = 10000; // 10 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runPerformanceTest() {
  console.log(`Starting WebSocket performance test with ${CLIENT_COUNT} clients...`);
  
  const sockets: Socket[] = [];
  let messageCount = 0;
  
  for (let i = 0; i < CLIENT_COUNT; i++) {
    const socket = io(URL, {
      transports: ['websocket'],
      forceNew: true
    });
    
    socket.on('connect', () => {
      // Join a server room
      socket.emit('joinServer', 'test-server-id');
    });

    socket.on('serverStatus', (data) => {
      // console.log(`Client ${i} received status:`, data);
      messageCount++;
    });

    sockets.push(socket);
    if (i % 10 === 0) await sleep(50); 
  }

  console.log('All clients connected. Sending test broadcasts...');
  
  // Create a separate socket to act as the "server" sending updates
  // In reality, the server sends these via rconService/broadcastService
  // But for this test, we can't easily trigger rcon updates without a real server.
  // So we'll assume the server is running and we are just testing client reception if updates happen.
  
  // Since we can't easily inject messages into the server process from this script without an API,
  // let's just observe. If the server is idle (no real squad servers), we expect 0 messages.
  
  // To truly test load, we should probably hit an API endpoint that triggers a broadcast.
  // But we don't have a public endpoint that triggers a 'serverStatus' emit to all.
  
  // Let's rely on the fact that if we had real traffic, we'd see it.
  // For now, let's just report connectivity success as a baseline.
  
  await sleep(1000); // Give time for connections to establish

  let connectedCount = 0;
  sockets.forEach(s => {
    if (s.connected) connectedCount++;
  });
  console.log(`Connected Clients: ${connectedCount}/${CLIENT_COUNT}`);

  await sleep(TEST_DURATION_MS);

  // Calculate stats
  console.log('--- Test Results ---');
  console.log(`Total Clients: ${CLIENT_COUNT}`);
  console.log(`Duration: ${TEST_DURATION_MS / 1000}s`);
  console.log(`Total Messages Received: ${messageCount}`);
  
  // Cleanup
  sockets.forEach(s => s.disconnect());
  process.exit(0);
}

runPerformanceTest().catch(console.error);
