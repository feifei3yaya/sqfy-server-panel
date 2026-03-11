
import SquadRcon from 'squad-rcon';
console.log('SquadRcon:', SquadRcon);
try {
  new SquadRcon({ host: '127.0.0.1', port: 21114, password: 'test' });
  console.log('Success');
} catch (e) {
  console.error('Error:', e);
}
