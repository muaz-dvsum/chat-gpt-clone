import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth() {
    try {
      const healthStatus = await this.healthService.getHealthStatus();
      return {
        success: true,
        data: healthStatus,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Health check failed',
          details: error.message,
        },
      };
    }
  }

  @Get('database')
  async checkDatabase() {
    try {
      const databaseHealth = await this.healthService.getDatabaseHealth();
      return {
        success: true,
        data: databaseHealth,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Database health check failed',
          details: error.message,
        },
      };
    }
  }

  @Get('detailed')
  async getDetailedHealth() {
    try {
      const detailedHealth = await this.healthService.getDetailedHealth();
      return {
        success: true,
        data: detailedHealth,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Detailed health check failed',
          details: error.message,
        },
      };
    }
  }
}