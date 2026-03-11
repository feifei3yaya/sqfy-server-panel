const { Rcon } = require('squad-rcon');

async function testRCON() {
  const rcon = new Rcon({
    id: 1,
    host: '127.0.0.1',
    port: 21114,
    password: 'Kw123456789',
    autoReconnect: false
  });

  try {
    await rcon.init();
    console.log('RCON 连接成功');

    const info = await rcon.execute('ShowServerInfo');
    console.log('ShowServerInfo 响应:', info);

    try {
      const parsed = JSON.parse(info);
      console.log('解析后的数据:');
      console.log('- ServerName:', parsed.ServerName);
      console.log('- CurrentMap:', parsed.CurrentMap);
      console.log('- PlayerCount:', parsed.PlayerCount);
      console.log('- MaxPlayers:', parsed.MaxPlayers);
    } catch (e) {
      console.log('JSON 解析失败');
    }

    await rcon.close();
  } catch (error) {
    console.error('RCON 连接失败:', error.message);
  }

  process.exit(0);
}

testRCON();
