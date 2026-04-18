const CryptoJS = require('crypto-js');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('list.json', 'utf8'));
const enc = data.encrypted_data;
const k1 = '5yI35PAW5lITlI4U';
const k2 = 'mJi5ntC5EgrnuwrQ';

for (let [keyStr, ivStr] of [[k1, k2], [k2, k1]]) {
  try {
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const iv = CryptoJS.enc.Utf8.parse(ivStr);
    const dec = CryptoJS.AES.decrypt(enc, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
    if (dec && dec.includes('{')) {
      console.log('Success! Key:', keyStr, 'IV:', ivStr);
      console.log('Data sample:', dec.slice(0, 200));
      process.exit(0);
    }
  } catch(e) {}
}
console.log('Failed');
