import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Multi-Level Marketing API')
    .setDescription(
      'Complete API documentation for Multi-Level Marketing application',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Products', 'Product management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('FAQ', 'FAQ management endpoints')
    .addTag('Admin', 'Admin operations endpoints')
    .addTag('Bank Details', 'User bank details management')
    .addTag('Payments', 'Payment processing with Razorpay')
    .addTag('Wishlist', 'User wishlist management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Multi-Level Marketing API Documentation',
  });

  app.enableCors({
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
    ],
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
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

// Handle the promise properly
bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
