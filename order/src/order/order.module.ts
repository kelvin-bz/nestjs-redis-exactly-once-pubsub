import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
