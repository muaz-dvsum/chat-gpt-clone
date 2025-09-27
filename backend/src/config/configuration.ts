export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chatgpt-clone',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  llm: {
    minDelay: parseInt(process.env.LLM_MIN_DELAY, 10) || 10000,
    maxDelay: parseInt(process.env.LLM_MAX_DELAY, 10) || 20000,
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});