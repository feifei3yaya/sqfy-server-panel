const CryptoJS = require('crypto-js');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('list.json', 'utf8'));
const enc = data.encrypted_data;

const candidates = [
  '5yI35PAW5lITlI4U',
  'mJi5ntC5EgrnuwrQ',
  '1234567890123456',
  '0123456789abcdef'
];

for (let k1 of candidates) {
  for (let k2 of candidates) {
    try {
      const key = CryptoJS.enc.Utf8.parse(k1);
      const iv = CryptoJS.enc.Utf8.parse(k2);
      const dec = CryptoJS.AES.decrypt(enc, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
      if (dec && dec.includes('server')) {
        console.log('Success!', k1, k2);
        console.log(dec.slice(0, 100));
        process.exit(0);
      }
    } catch(e) {}
  }
}
console.log('Failed');
