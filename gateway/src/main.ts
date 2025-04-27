import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Project4 Gateway API')
    .setDescription('API documentation for Project4 Gateway')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    }, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;
  await app.listen(port);
  // Show documentation URL on startup (dynamic, from env)
  console.log(`\nAPI documentation available at http://${host}:${port}/api\n`);
}
bootstrap();
