import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';
import { InventoryModule } from '../inventory/inventory.module';
import { InventoryService } from '../inventory/inventory.service';

@Module({
  imports: [
    InventoryModule,
    NestRedisModule.forRoot({
      type: 'single',
      url: 'redis://default:yourpassword@yourhost:yourport',
    }),
  ],
  providers: [RedisService, InventoryService],
  exports: [RedisService],
})
export class RedisModule {}
