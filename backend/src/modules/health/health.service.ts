import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface DatabaseHealth {
  database: string;
  connection: string;
  timestamp: string;
  readyState: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('nodeEnv', 'development'),
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      },
    };
  }

  async getDatabaseHealth(): Promise<DatabaseHealth> {
    try {
      const readyStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      // Test database connection with a simple ping
      await this.connection.db.admin().ping();

      return {
        database: 'mongodb',
        connection: 'healthy',
        timestamp: new Date().toISOString(),
        readyState: readyStates[this.connection.readyState] || 'unknown',
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        database: 'mongodb',
        connection: 'unhealthy',
        timestamp: new Date().toISOString(),
        readyState: 'error',
      };
    }
  }

  async getDetailedHealth(): Promise<{
    application: HealthStatus;
    database: DatabaseHealth;
    overall: string;
  }> {
    const [appHealth, dbHealth] = await Promise.all([
      this.getHealthStatus(),
      this.getDatabaseHealth(),
    ]);

    const overall = dbHealth.connection === 'healthy' ? 'healthy' : 'degraded';

    return {
      application: appHealth,
      database: dbHealth,
      overall,
    };
  }
}