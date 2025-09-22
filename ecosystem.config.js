module.exports = {
  apps: [
    {
      name: 'proptech-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 'max', // Usar todos los CPUs disponibles
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Configuración de logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configuración de reinicio automático
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Configuración de health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    },
  ],
  
  // Configuración de deploy (opcional)
  deploy: {
    production: {
      user: 'tu-usuario',
      host: 'tu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/on-proptech-frontend.git',
      path: '/var/www/on-proptech-frontend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
}; 