import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  MONGO_URI: process.env.MONGO_URI || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

if (!ENV.MONGO_URI) {
  throw new Error('Falta la variable de entorno MONGO_URI');
}