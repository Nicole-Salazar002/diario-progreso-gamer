import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { conectarDB } from './config/conexionDB';
import { requestIdMiddleware } from './middleware/requestId';
import { loggerMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import videojuegosRoutes from './routes/videojuegos.routes';
import partidasRoutes from './routes/partidas.routes';

const app = express();

conectarDB();

app.use(cors()); // Permite peticiones locales
app.use(express.json());
app.use(requestIdMiddleware);
app.use(loggerMiddleware);

app.use('/api/videojuegos', videojuegosRoutes);
app.use('/api/partidas', partidasRoutes);

app.use(errorHandler);

app.listen(ENV.PORT, () => {
  console.log(`Servidor corriendo en puerto ${ENV.PORT}`);
});