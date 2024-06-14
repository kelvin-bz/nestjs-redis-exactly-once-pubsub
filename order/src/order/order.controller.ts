import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async placeOrder(@Body() order: any) {
    await this.orderService.placeOrder(order);
    return { message: 'Order placed successfully' };
  }
}
