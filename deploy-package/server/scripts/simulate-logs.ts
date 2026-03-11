import fs from 'fs';
import path from 'path';

const LOG_DIR = 'D:\\squad_server\\SquadGame\\Saved\\Logs';
const LOG_FILE = path.join(LOG_DIR, 'SquadGame.log');

// Ensure directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

console.log(`Simulating logs to: ${LOG_FILE}`);

const appendLog = (msg: string) => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '.').replace('T', '-').slice(0, 23);
  // Squad format: [2023.10.27-12.34.56:789][123]
  const logLine = `[${timestamp}][123]${msg}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
  console.log(`Appended: ${msg}`);
};

const players = [
  { name: 'PlayerA', id: '76561198000000001' },
  { name: 'PlayerB', id: '76561198000000002' },
  { name: 'PlayerC', id: '76561198000000003' },
  { name: 'AdminUser', id: '76561198000000004' }
];

const weapons = ['M4A1', 'AK-74', 'Frag Grenade', 'RPG-7'];

let counter = 0;

setInterval(() => {
  const action = Math.random();
  const p1 = players[Math.floor(Math.random() * players.length)];
  const p2 = players[Math.floor(Math.random() * players.length)];
  
  if (action < 0.1) {
    // Chat
    appendLog(`LogSquad: Chat: ${p1.name} (Steam ID: ${p1.id}): Hello everyone! Message #${counter++}`);
  } else if (action < 0.4) {
    // Kill
    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    appendLog(`LogSquad: Player: ${p2.name} (Steam ID: ${p2.id}) has been killed by ${p1.name} (Steam ID: ${p1.id}) with ${weapon}`);
  } else if (action < 0.5) {
    // Wound
    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    appendLog(`LogSquad: Player: ${p2.name} (Steam ID: ${p2.id}) has been wounded by ${p1.name} (Steam ID: ${p1.id}) with ${weapon}`);
  } else if (action < 0.6) {
    // Admin command
    appendLog(`LogSquad: ADMIN COMMAND: AdminBroadcast Hello World executed by AdminUser (Steam ID: 76561198000000004)`);
  } else if (action < 0.7) {
     // Pos (Fly detection simulation)
     // LogSquadTrace: [DedicatedServer]Player Name (Steam ID: 76561198000000000) saved location: X=123.45 Y=678.90 Z=100.00
     const x = (Math.random() * 1000).toFixed(2);
     const y = (Math.random() * 1000).toFixed(2);
     const z = (Math.random() * 100).toFixed(2);
     appendLog(`LogSquadTrace: [DedicatedServer]Player ${p1.name} (Steam ID: ${p1.id}) saved location: X=${x} Y=${y} Z=${z}`);
  }
}, 3000);
