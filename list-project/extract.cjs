const fs = require('fs');
let code = fs.readFileSync('/workspace/script.js', 'utf8');
code = `
const document = { 
  addEventListener: (e, cb) => { cb(); },
  getElementById: () => ({ addEventListener: () => {} }) 
};
const window = {};
` + code;
code = code.replace(/const serverListElement = document.*/, 'console.log("Key:", ENCRYPTION_KEY); process.exit(0);');

fs.writeFileSync('/workspace/list-project/patched.js', code);
