// config/server.js
const cronTasks = require('./cron-tasks');

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 10000),
  url: env('PUBLIC_URL'),
  name: env('APP_NAME', ''),   // optional — leave blank or set in .env
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
   cron: {
    enabled: true,
    tasks: cronTasks,
  },
});