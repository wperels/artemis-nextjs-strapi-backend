'use strict';

const fetch = require('node-fetch');
const cron = require('node-cron');

async function fetchAndSaveAPOD(strapi) {
  try {
    console.log('🚀 Fetching NASA APOD...');

    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}`
    );

    if (!res.ok) {
      throw new Error(`NASA API responded with status: ${res.status}`);
    }

    const data = await res.json();

    // Check if entry for today already exists
    const existing = await strapi.documents('api::nasa-image.nasa-image').findMany({
      filters: { date: { $eq: data.date } },
    });

    if (existing.length > 0) {
      console.log(`⏭️  Entry for ${data.date} already exists — skipping.`);
      return;
    }

    await strapi.documents('api::nasa-image.nasa-image').create({
      data: {
        title: data.title,
        date: data.nasaDate,
        explanation: data.explanation,
        url: data.imageUrl,
        hdurl: data.hdurl || null,
        mediaType: data.mediaType,
      },
    });

    console.log(`✅ APOD saved: ${data.title} (${data.date})`);
  } catch (err) {
    console.error('❌ NASA APOD fetch failed:', err.message);
  }
}

module.exports = {
  async register({ strapi }) {},

  async bootstrap({ strapi }) {
    // Fetch once on boot
    await fetchAndSaveAPOD(strapi);

    // Then fetch every day at 8:00 AM server time
    cron.schedule('0 8 * * *', async () => {
      console.log('⏰ Cron triggered: fetching NASA APOD...');
      await fetchAndSaveAPOD(strapi);
    });

    console.log('📅 NASA APOD cron job scheduled for 08:00 daily.');
  },
};