module.exports = {
  apps: [
    {
      name: 'quiklii-backend',
      script: 'backend/src/app-db.js',
      node_args: '--experimental-modules',
      cwd: '..',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        FRONTEND_URL: 'http://localhost:5173',
        USE_POSTGRES: 'false'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        FRONTEND_URL: 'http://localhost:5173',
        USE_POSTGRES: 'false'
      },
      // Configuraciones de PM2
      watch: true,
      watch_delay: 1000,
      ignore_watch: [
        'node_modules',
        'logs',
        'src/data',
        '*.sqlite'
      ],
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Reinicio automático en caso de crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
