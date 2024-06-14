import { Controller, Get } from '@nestjs/common';

@Controller('inventory')
export class InventoryController {
  @Get()
  getInventory() {
    return 'Hello inventory Service';
  }
}
