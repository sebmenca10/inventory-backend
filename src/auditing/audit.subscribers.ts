import {
  EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource,
} from 'typeorm';
import { AuditLog } from './audit.entity';
import { RequestContext } from '../common/request-context';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(private dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return Object;
  }

  async afterInsert(event: InsertEvent<any>) {
    await this.save('create', event.entity, undefined);
  }
  async afterUpdate(event: UpdateEvent<any>) {
    await this.save('update', event.entity, event.databaseEntity);
  }
  async afterRemove(event: RemoveEvent<any>) {
    await this.save('delete', undefined, event.databaseEntity);
  }

  private async save(
    action: 'create' | 'update' | 'delete',
    after?: any,
    before?: any,
  ) {
    if (!after && !before) return;

    const entityName =
      after?.constructor?.name ?? before?.constructor?.name ?? 'Unknown';

    // 🚫 Ignorar entidades no relevantes
    if (
      entityName === 'AuditLog' ||
      entityName === 'Object' ||
      entityName === 'Array' ||
      entityName.startsWith('Anonymous')
    ) {
      return;
    }

    const ctx = RequestContext.current();
    const repo = this.dataSource.getRepository(AuditLog);

    const safeBefore = this.sanitizeEntity(before);
    const safeAfter = this.sanitizeEntity(after);
    
    await repo
      .createQueryBuilder()
      .insert()
      .into(AuditLog)
      .values({
        userId: ctx?.userId || 'system',
        userEmail: ctx?.userEmail || 'system@local',
        action,
        entity: entityName,
        entityId: after?.id ?? before?.id ?? 'n/a',
        before: safeBefore,
        after: safeAfter,
      })
      .execute();

    console.log(`AUDIT ${action} ${entityName}`);
  }

  private sanitizeEntity(entity: any) {
    if (!entity) return null;
    try {
      return JSON.parse(JSON.stringify(entity));
    } catch {
      return null;
    }
  }

}