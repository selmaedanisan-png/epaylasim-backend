import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  use(req: Request, _res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    this.logger.debug(`[${ip}] ${method} ${originalUrl}`);
    next();
  }
}
