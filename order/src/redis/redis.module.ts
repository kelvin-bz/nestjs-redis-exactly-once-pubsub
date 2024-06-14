import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Module({
  imports: [
    NestRedisModule.forRoot({
      type: 'single',
      url: 'redis://default:yourpassword@yourhost:yourport',
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
