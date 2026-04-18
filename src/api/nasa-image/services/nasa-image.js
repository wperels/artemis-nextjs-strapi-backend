'use strict';

/**
 * nasa-image service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::nasa-image.nasa-image');
