module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      // lifespans expressed as integers (days). Adjust via env if needed.
      maxRefreshTokenLifespan: env.int('ADMIN_MAX_REFRESH_TOKEN_LIFESPAN', 2592000),
      maxSessionLifespan: env.int('ADMIN_MAX_SESSION_LIFESPAN', 3600),
    },
  },
  secrets: {
    encryptionKey: env('ADMIN_ENCRYPTION_KEY'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
