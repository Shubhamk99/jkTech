import { Injectable } from '@nestjs/common';

/**
 * Service for handling basic application logic in the gateway.
 * Currently provides a hello world endpoint.
 */
@Injectable()
export class AppService {
  /**
   * Returns a hello world string.
   * @returns A hello world message.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
