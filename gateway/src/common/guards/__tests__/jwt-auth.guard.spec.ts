import { JwtAuthGuard } from '../jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
  // Integration tests for JwtAuthGuard are typically done at the controller level
});
