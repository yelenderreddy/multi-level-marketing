import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://127.0.0.1:5500','http://localhost:3001'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.SERVER_PORT ?? 3000;
  const env = process.env.NODE_ENV ?? 'development';
  const now = new Date().toISOString();

  await app.listen(port);

  console.log(`🚀 Server started`);
  console.log(`📅 Time: ${now}`);
  console.log(`🌐 Environment: ${env}`);
  console.log(`🔗 Listening on: http://localhost:${port}`);
}

bootstrap();
