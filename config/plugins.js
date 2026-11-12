module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      security: {
        allowedFileTypes: ['image/*'],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    },
  },
  'users-permissions': {
    config: {
      jwtManagement: 'legacy-support',
      jwt: { expiresIn: '7d' },
    },
  },
});