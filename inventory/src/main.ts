import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as tracer from 'dd-trace';

tracer.init({
  env: 'development', // Change to 'production' in production
  service: 'nestjs-service', // Name of your service
  hostname: 'localhost', // Datadog agent host
  logInjection: true, // Inject trace IDs into logs for correlation
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
