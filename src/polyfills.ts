import * as crypto from 'crypto';

// Inyecta crypto global para librerías (como TypeORM)
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}