import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración de validación global para DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configurar carpeta estática para la página web (Frontend)
  const cwdPublic = join(process.cwd(), 'public');
  const dirPublic = join(__dirname, '..', 'public');
  const staticPath = existsSync(cwdPublic) ? cwdPublic : dirPublic;

  app.useStaticAssets(staticPath);
  logger.log(`Archivos estáticos servidos desde: ${staticPath}`);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
  logger.log(`🌐 Interfaz Web disponible en http://localhost:${port}`);
  logger.log(`📦 API CRUD de Productos: http://localhost:${port}/api/productos`);
  logger.log(`🔍 Diagnóstico de Base de Datos: http://localhost:${port}/api/database/status`);
}

await bootstrap();
