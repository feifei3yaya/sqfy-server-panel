module.exports = {
  apps: [
    {
      name: 'sqfy-api',
      cwd: './server',
      script: './dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'sqfy-web',
      cwd: './client',
      script: './static-server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 80,
      },
    },
  ],
};
