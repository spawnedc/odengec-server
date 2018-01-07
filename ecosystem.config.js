module.exports = {
  apps: [{
    name: 'odengec-server',
    script: './dist/server.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-52-215-85-246.eu-west-1.compute.amazonaws.com',
      key: '~/.ssh/odengec-server.pem',
      ref: 'origin/master',
      repo: 'git@github.com:spawnedc/odengec-server.git',
      path: '/home/ubuntu/odengec-server',
      'post-deploy': 'npm install && npm run build && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
