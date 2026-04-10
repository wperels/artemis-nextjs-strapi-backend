// src/index.js
'use strict';

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    // TEMPORARY TEST — remove after confirming cron task works
    strapi.log.info('🧪 Manually triggering NASA fetch test...');
    const cronTasks = require('../config/cron-tasks');
    await cronTasks.fetchNasaAPOD.task({ strapi });
  },
};