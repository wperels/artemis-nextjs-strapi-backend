// config/cron-tasks.js
const { v2: cloudinary } = require('cloudinary');
const fetch = require('node-fetch');

module.exports = {
  fetchNasaAPOD: {
    task: async ({ strapi }) => {
      try {
        const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
        const res = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
        );

        if (!res.ok) {
          strapi.log.error(`NASA API responded with status: ${res.status}`);
          return;
        }

        const apod = await res.json();

        if (apod.media_type !== 'image') {
          strapi.log.info(`APOD skipped — media type is: ${apod.media_type}`);
          return;
        }

        const existing = await strapi.documents('api::nasa-image.nasa-image').findFirst({
          filters: { nasaDate: apod.date },
        });

        if (existing) {
          strapi.log.info(`APOD for ${apod.date} already exists, skipping.`);
          return;
        }

        const uploaded = await cloudinary.uploader.upload(apod.url, {
          folder: 'nasa-apod',
          public_id: `apod-${apod.date}`,
          overwrite: false,
          resource_type: 'image',
        });

        await strapi.documents('api::nasa-image.nasa-image').create({
          data: {
            title: apod.title,
            explanation: apod.explanation,
            imageUrl: uploaded.secure_url,
            hdUrl: apod.hdurl || null,
            nasaDate: apod.date,
            mediaType: apod.media_type,
            copyright: apod.copyright || null,
            featured: false,
          },
          status: 'published',
        });

        strapi.log.info(`✅ APOD saved: ${apod.title} (${apod.date})`);

      } catch (err) {
        strapi.log.error('NASA cron task failed:', err);
      }
    },
    options: {
      rule: '0 0 6 * * *',
    },
  },

  // TEMPORARY TEST — delete after confirming it works
  testNasaFetch: {
    task: async ({ strapi }) => {
      strapi.log.info('🧪 Manual NASA test firing...');

      const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

      // Debug: confirm key is loaded
      strapi.log.info(`Using NASA API key: ${apiKey !== 'DEMO_KEY' ? 'found ✅' : 'using DEMO_KEY ⚠️'}`);

      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
      );

      // Debug: log raw response before parsing
      const rawText = await res.text();
      strapi.log.info(`NASA raw response: ${rawText.substring(0, 200)}`);

      // Now parse
      let apod;
      try {
        apod = JSON.parse(rawText);
      } catch (parseErr) {
        strapi.log.error(`Failed to parse NASA response as JSON: ${rawText.substring(0, 200)}`);
        return;
      }

      if (apod.media_type !== 'image') {
        strapi.log.info(`Skipped — media type: ${apod.media_type}`);
        return;
      }

      const { v2: cloudinary } = require('cloudinary');
      const uploaded = await cloudinary.uploader.upload(apod.url, {
        folder: 'nasa-apod',
        public_id: `apod-${apod.date}`,
        overwrite: false,
        resource_type: 'image',
      });

      await strapi.documents('api::nasa-image.nasa-image').create({
        data: {
          title: apod.title,
          explanation: apod.explanation,
          imageUrl: uploaded.secure_url,
          hdUrl: apod.hdurl || null,
          nasaDate: apod.date,
          mediaType: apod.media_type,
          copyright: apod.copyright || null,
          featured: false,
        },
        status: 'published',
      });

      strapi.log.info(`✅ Test complete: ${apod.title}`);
    },
    options: new Date(Date.now() + 5000),
  },
};