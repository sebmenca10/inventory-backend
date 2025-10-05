import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const key = req.headers['idempotency-key'];
    if (!key) return next.handle(); // si no hay header, comportamiento normal

    return from(this.idempotencyService.find(key)).pipe(
      mergeMap((existing) => {
        if (existing) {
          //ya existe → devolver respuesta previa
          res.status(existing.status).json(existing.response);
          return new Observable(); // detener flujo
        }

        return next.handle().pipe(
          tap(async (data) => {
            try {
              await this.idempotencyService.saveRecord(
                key,
                req.path,
                req.method,
                data,
                res.statusCode,
              );
            } catch (err) {
              console.error('Error saving idempotency record:', err.message);
            }
          }),
        );
      }),
    );
  }
}