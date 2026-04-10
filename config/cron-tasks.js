// config/cron-tasks.js
const { v2: cloudinary } = require('cloudinary');

module.exports = {
  fetchNasaAPOD: {
    task: async ({ strapi }) => {
      try {
        // 1. Fetch today's image from NASA
        const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
        const res = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
        );

        if (!res.ok) {
          strapi.log.error(`NASA API responded with status: ${res.status}`);
          return;
        }

        const apod = await res.json();

        // 2. Skip videos
        if (apod.media_type !== 'image') {
          strapi.log.info(`APOD skipped — media type is: ${apod.media_type}`);
          return;
        }

        // 3. Check for duplicate
        const existing = await strapi.documents('api::nasa-image.nasa-image').findFirst({
          filters: { nasaDate: apod.date },
        });

        if (existing) {
          strapi.log.info(`APOD for ${apod.date} already exists, skipping.`);
          return;
        }

        // 4. Upload to Cloudinary
        const uploaded = await cloudinary.uploader.upload(apod.url, {
          folder: 'nasa-apod',
          public_id: `apod-${apod.date}`,
          overwrite: false,
          resource_type: 'image',
        });

        // 5. Save to Strapi
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
      rule: '0 0 6 * * *', // Every day at 6:00 AM UTC
    },
  },
};