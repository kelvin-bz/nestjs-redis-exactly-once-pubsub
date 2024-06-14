import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OrderService {
  constructor(private readonly redisService: RedisService) {}

  async placeOrder(order: any) {
    // Create a unique order ID
    const orderId = new Date().getTime().toString();
    const orderMessage = JSON.stringify({ id: orderId, ...order });
    // Publish order message to Redis channel
    await this.redisService.publishMessage('order_updates', orderMessage);
  }
}
