import { Controller, Get, Post } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import type { DatabaseStatus } from './database.service.js';

@Controller('api/database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('status')
  getStatus(): DatabaseStatus {
    return this.databaseService.getStatus();
  }

  @Post('reconnect')
  async reconnect(): Promise<DatabaseStatus> {
    return await this.databaseService.tryReconnect();
  }
}
