const fetch = require('node-fetch');
const crypto = require('crypto');

async function go() {
  const html = await (await fetch('https://list.squadovo.cn/')).text();
  const match = html.match(/src="\/_next\/static\/chunks\/pages\/_app-([a-f0-9]+)\.js"/);
  if (!match) return console.log('no match');
  const jsUrl = `https://list.squadovo.cn/_next/static/chunks/pages/_app-${match[1]}.js`;
  const js = await (await fetch(jsUrl)).text();
  
  // Find key and IV
  const keyMatch = js.match(/const \w+="([a-zA-Z0-9]+)"/g);
  console.log('keyMatch:', keyMatch);
}
go();
