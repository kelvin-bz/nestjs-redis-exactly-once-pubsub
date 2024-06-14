import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { promisify } from 'util';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  onModuleInit() {
    this.subscribeToChannel('order_updates');
  }

  async publishMessage(channel: string, message: string) {
    await this.redis.publish(channel, message);
  }

  private async subscribeToChannel(channel: string) {
    const subscriber = this.redis.duplicate();

    subscriber.on('message', async (channel, message) => {
      this.logger.log(`Received message from ${channel}: ${message}`);
      await this.handleMessage(message);
    });

    await subscriber.subscribe(channel);
  }

  private async handleMessage(message: string) {
    const messageId = this.extractMessageId(message);
    const lockKey = `lock:${messageId}`;

    if (await this.acquireLock(lockKey)) {
      try {
        // Process the message here
        this.logger.log(`Processing message: ${message}`);
        // Simulate message processing
        await this.processMessage(message);
      } finally {
        await this.releaseLock(lockKey);
      }
    } else {
      this.logger.warn(`Skipping duplicate message: ${messageId}`);
    }
  }

  private async processMessage(message: string) {
    console.log('Processing message:', message);
    // Simulate message processing time
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private extractMessageId(message: string): string {
    // Extract a unique message ID from the message
    return JSON.parse(message).id;
  }

  private async acquireLock(key: string, ttl = 5000): Promise<boolean> {
    const setAsync = promisify(this.redis.set).bind(this.redis);
    const result = await setAsync(key, 'locked', 'NX', 'PX', ttl);
    return result === 'OK';
  }

  private async releaseLock(key: string) {
    await this.redis.del(key);
  }
}
