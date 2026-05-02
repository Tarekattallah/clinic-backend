const isProd = process.env.NODE_ENV === 'production';

const logger = {
  info:  (...args) => { if (!isProd) console.log('[INFO]',  ...args); },
  error: (...args) => { console.error('[ERROR]', ...args); }, // always log errors
  warn:  (...args) => { if (!isProd) console.warn('[WARN]',  ...args); },
};

module.exports = logger;
