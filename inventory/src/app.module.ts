import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { DatadogLogger } from './datadog-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: Logger, useClass: DatadogLogger }],
})
export class AppModule {}
